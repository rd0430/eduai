import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// ==========================================
// 1. XAVFSIZLIK VA CORS
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = [
  'https://eduai-09.up.railway.app',
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS siyosati: Ushbu domendan so‘rov yuborish taqiqlangan!'));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', generalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Juda ko‘p urinish! 15 daqiqadan keyin qayta urining.' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Soatlik AI limiti tugadi.' }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

// ==========================================
// 2. SUPABASE, GEMINI VA TELEGRAM BOT
// ==========================================
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const getJwtSecret = () => process.env.JWT_SECRET || 'eduai_fallback_dev_secret_change_in_prod';

async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId).trim(),
        text,
        parse_mode: 'HTML'
      })
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error('Telegram xabar yuborishda xato:', err.message);
    return false;
  }
}

function getPaymentStatus(isPaid, dueDateStr) {
  if (isPaid) {
    return { color: 'green', label: "To'langan ✓", isOverdue: false };
  }
  if (!dueDateStr) {
    return { color: 'yellow', label: 'Sana belgilanmagan', isOverdue: false };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { color: 'red', label: `Muddati o'tgan (${Math.abs(diffDays)} kun)`, isOverdue: true };
  }
  if (diffDays < 3) {
    return { color: 'yellow', label: `${diffDays} kun qoldi`, isOverdue: false };
  }
  return { color: 'green', label: `${diffDays} kun bor`, isOverdue: false };
}

async function checkAndNotifyOverduePayments() {
  if (!supabase) return 0;
  const { data: students } = await supabase
    .from('users')
    .select('id, full_name, payment_due_date, is_paid, parent_telegram_chat_id, group_id')
    .eq('role', 'student')
    .eq('is_paid', false);

  const { data: groups } = await supabase.from('groups').select('id, name, price');
  const groupMap = Object.fromEntries((groups || []).map(g => [g.id, g]));

  let sentCount = 0;
  for (const st of students || []) {
    const status = getPaymentStatus(st.is_paid, st.payment_due_date);
    if (status.color === 'red' && st.parent_telegram_chat_id) {
      const grp = groupMap[st.group_id];
      const courseName = grp?.name || 'O‘quv kursi';
      const priceText = grp?.price ? `${Number(grp.price).toLocaleString()} so'm` : 'belgilangan narx';
      const msg =
        `🔴 <b>TO'LOV ESLATMASI (EduAI)</b>\n\n` +
        `Hurmatli ota-ona! Farzandingiz <b>${st.full_name}</b>ning <b>"${courseName}"</b> kursi uchun oylik to'lov muddati o'tib ketdi.\n` +
        `📅 To'lov sanasi: <b>${st.payment_due_date}</b>\n` +
        `💰 Kurs narxi: <b>${priceText}</b>\n\n` +
        `Iltimos, to'lovni amalga oshirishingizni so'raymiz.`;
      const ok = await sendTelegramMessage(st.parent_telegram_chat_id, msg);
      if (ok) sentCount++;
    }
  }
  return sentCount;
}

setInterval(() => {
  checkAndNotifyOverduePayments().catch(() => {});
}, 6 * 60 * 60 * 1000);

// ==========================================
// 3. MIDDLEWARE
// ==========================================
const checkConfig = (req, res, next) => {
  if (!supabase) return res.status(500).json({ error: 'SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY kiritilmagan!' });
  next();
};

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token topilmadi' });
  try {
    req.user = jwt.verify(header.split(' ')[1], getJwtSecret());
    next();
  } catch {
    res.status(403).json({ error: 'Token yaroqsiz yoki muddati tugagan' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Faqat Super Admin (Gmail) uchun!' });
  }
  next();
};

const requireAdminOrOwner = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'center_owner') {
    return res.status(403).json({ error: 'Faqat Admin yoki O‘quv markaz egasi uchun!' });
  }
  next();
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', port: process.env.PORT || 5000 });
});

// ==========================================
// 4. AUTHENTICATION (FAQAT LOGIN VA GMAIL ADMIN)
// ==========================================
app.get('/api/auth/google-config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || '' });
});

app.post('/api/auth/google-admin', loginLimiter, async (req, res) => {
  try {
    if (!googleClient) return res.status(500).json({ error: 'GOOGLE_CLIENT_ID kiritilmagan!' });
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google token yuborilmadi' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const allowedAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

    if (!payload?.email || (allowedAdminEmail && payload.email.toLowerCase() !== allowedAdminEmail)) {
      return res.status(403).json({ error: 'Ushbu Gmail akkauntga Admin ruxsati berilmagan!' });
    }

    const token = jwt.sign(
      { id: 'super_admin', role: 'admin', email: payload.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: 'super_admin',
        fullName: payload.name || 'Super Admin',
        username: payload.email,
        role: 'admin',
        avatarUrl: payload.picture
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Google Gmail kirish xatosi: ' + err.message });
  }
});

app.post('/api/auth/login', loginLimiter, checkConfig, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Login va parol kiritilishi shart' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, subject, username, role, group_id, xp_points, streak_days, last_active_date, is_active, password_hash, avatar_url')
      .eq('username', String(username).trim().toLowerCase())
      .single();

    if (error || !user) return res.status(401).json({ error: 'Login yoki parol noto‘g‘ri' });
    if (!user.is_active) return res.status(403).json({ error: 'Akkaunt bloklangan' });

    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Login yoki parol noto‘g‘ri' });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let streak = user.streak_days || 0;
    if (user.last_active_date !== today) streak = user.last_active_date === yesterday ? streak + 1 : 1;

    await supabase
      .from('users')
      .update({ last_active_date: today, streak_days: streak, is_online: true, last_seen: new Date().toISOString() })
      .eq('id', user.id);

    const token = jwt.sign({ id: user.id, role: user.role, group_id: user.group_id }, getJwtSecret(), { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        subject: user.subject,
        username: user.username,
        role: user.role,
        groupId: user.group_id,
        xp: user.xp_points,
        streak,
        avatarUrl: user.avatar_url
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  if (supabase && req.user.id !== 'super_admin') {
    await supabase.from('users').update({ is_online: false }).eq('id', req.user.id);
  }
  res.json({ ok: true });
});

// ==========================================
// 5. ADMIN (GMAIL) -> CENTER OWNER YARATISH VA BOSHQARISH
// ==========================================
app.post('/api/admin/center-owners', authenticate, requireSuperAdmin, checkConfig, async (req, res) => {
  try {
    const { fullName, centerName } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ error: 'Ism-familiya kiritilishi shart' });

    const cleanFirst = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'owner';
    const username = `owner_${cleanFirst}_${Math.floor(100 + Math.random() * 900)}`;
    const plainPassword = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const { data: owner, error } = await supabase
      .from('users')
      .insert({
        role: 'center_owner',
        full_name: fullName.trim().slice(0, 120),
        subject: centerName?.trim().slice(0, 100) || "O'quv markaz",
        username,
        password_hash: passwordHash,
        is_active: true
      })
      .select('id, full_name, subject, username')
      .single();

    if (error) throw error;
    res.json({
      id: owner.id,
      fullName: owner.full_name,
      centerName: owner.subject,
      username,
      plainPassword
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. CENTER OWNER -> O'QITUVCHI VA O'QUVCHI LOGIN-PAROL YARATISH
// ==========================================
app.post('/api/owner/teachers', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  try {
    const { fullName, subject } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ error: 'O‘qituvchi ism-familiyasi shart' });

    const cleanFirst = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'ustoz';
    const username = `ustoz_${cleanFirst}_${Math.floor(100 + Math.random() * 900)}`;
    const plainPassword = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const { data: teacher, error } = await supabase
      .from('users')
      .insert({
        role: 'teacher',
        full_name: fullName.trim().slice(0, 120),
        subject: subject?.trim().slice(0, 80) || 'Umumiy fan',
        username,
        password_hash: passwordHash,
        is_active: true
      })
      .select('id, full_name, subject, username')
      .single();

    if (error) throw error;
    res.json({
      id: teacher.id,
      fullName: teacher.full_name,
      subject: teacher.subject,
      username,
      plainPassword
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owner/students', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  try {
    const { fullName, groupId, paymentDueDate, parentTelegramChatId } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ error: 'O‘quvchi ism-familiyasi shart' });

    const cleanFirst = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'student';
    const username = `${cleanFirst}_${Math.floor(100 + Math.random() * 900)}`;
    const plainPassword = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const dueDate = paymentDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const { data: student, error } = await supabase
      .from('users')
      .insert({
        role: 'student',
        full_name: fullName.trim().slice(0, 120),
        username,
        password_hash: passwordHash,
        group_id: groupId || null,
        payment_due_date: dueDate,
        is_paid: false,
        parent_telegram_chat_id: parentTelegramChatId ? String(parentTelegramChatId).trim() : null,
        is_active: true
      })
      .select('id, full_name, username, group_id, payment_due_date')
      .single();

    if (error) throw error;
    res.json({
      id: student.id,
      fullName: student.full_name,
      username,
      plainPassword
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Istalgan foydalanuvchi (owner, teacher, student) parolini yangilash
app.post('/api/users/:id/reset-password', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  try {
    const plainPassword = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const { data: user, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', req.params.id)
      .select('full_name, username, role')
      .single();

    if (error || !user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    res.json({ fullName: user.full_name, username: user.username, role: user.role, plainPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. MAHALLA -> UY -> XONA MA'LUMOTLARI
// ==========================================
app.get('/api/center/data', authenticate, checkConfig, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [{ data: branches }, { data: groups }, { data: users }, { data: attendance }] = await Promise.all([
      supabase.from('branches').select('*').order('created_at', { ascending: true }),
      supabase.from('groups').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('id, role, full_name, subject, username, is_active, group_id, payment_due_date, is_paid, parent_telegram_chat_id, xp_points, streak_days'),
      supabase.from('attendance').select('*').order('attendance_date', { ascending: false })
    ]);

    const centerOwners = (users || []).filter(u => u.role === 'center_owner');
    const teachers = (users || []).filter(u => u.role === 'teacher');
    const students = (users || []).filter(u => u.role === 'student');
    const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));
    const todayAttendance = (attendance || []).filter(a => a.attendance_date === today);

    const enrichedGroups = (groups || []).map(g => {
      const grpStudents = students.filter(s => s.group_id === g.id);
      const grpTodayAtt = todayAttendance.filter(a => a.group_id === g.id);
      const isAttendanceMissing = grpStudents.length > 0 && grpTodayAtt.length === 0;

      return {
        ...g,
        price: Number(g.price || 0),
        mainTeacherName: teacherMap[g.teacher_id]?.full_name || 'Tayinlanmagan',
        substituteTeacherName: g.substitute_teacher_id ? (teacherMap[g.substitute_teacher_id]?.full_name || '') : null,
        studentCount: grpStudents.length,
        isAttendanceMissing
      };
    });

    const groupMap = Object.fromEntries(enrichedGroups.map(g => [g.id, g]));

    const enrichedStudents = students.map(s => {
      const grp = groupMap[s.group_id];
      const todayAtt = todayAttendance.find(a => a.student_id === s.id && a.group_id === s.group_id);
      return {
        ...s,
        groupName: grp?.name || 'Guruhsiz',
        coursePrice: grp ? Number(grp.price || 0) : 0,
        paymentStatus: getPaymentStatus(s.is_paid, s.payment_due_date),
        todayAttendance: todayAtt ? todayAtt.status : null
      };
    });

    const enrichedTeachers = teachers.map(t => ({
      ...t,
      assignedGroups: enrichedGroups.filter(g => g.teacher_id === t.id || g.substitute_teacher_id === t.id)
    }));

    res.json({
      branches: branches || [],
      groups: enrichedGroups,
      centerOwners,
      teachers: enrichedTeachers,
      students: enrichedStudents,
      attendance: attendance || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Filial qo'shish / o'chirish
app.post('/api/branches', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { name, address } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Filial nomi shart' });

  const { data, error } = await supabase
    .from('branches')
    .insert({
      owner_id: req.user.id !== 'super_admin' ? req.user.id : null,
      name: name.trim(),
      address: address?.trim() || ''
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/branches/:id', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { error } = await supabase.from('branches').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Guruh ochish / o'chirish / o'qituvchi almashtirish
app.post('/api/groups', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { branchId, name, price, lessonDays, lessonTime, teacherId } = req.body;
  if (!branchId || !name?.trim() || !teacherId) {
    return res.status(400).json({ error: 'Filial, guruh nomi va o‘qituvchi tanlanishi shart' });
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      branch_id: branchId,
      name: name.trim(),
      price: Number(price) || 0,
      lesson_days: lessonDays?.trim() || 'Dush, Chor, Jum',
      lesson_time: lessonTime?.trim() || '14:00 - 16:00',
      teacher_id: teacherId
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/groups/:id', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { error } = await supabase.from('groups').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.put('/api/groups/:id/substitute', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { substituteTeacherId } = req.body;
  const { error } = await supabase
    .from('groups')
    .update({ substitute_teacher_id: substituteTeacherId || null })
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// O'quvchini guruhga yozish / transfer / to'lov / o'chirish
app.put('/api/students/:id/enroll', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { groupId, paymentDueDate, parentTelegramChatId } = req.body;
  const updatePayload = { group_id: groupId || null, is_paid: false };
  if (paymentDueDate) updatePayload.payment_due_date = paymentDueDate;
  if (parentTelegramChatId !== undefined) {
    updatePayload.parent_telegram_chat_id = String(parentTelegramChatId).trim() || null;
  }

  const { error } = await supabase.from('users').update(updatePayload).eq('id', req.params.id).eq('role', 'student');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.put('/api/students/:id/transfer', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { newGroupId } = req.body;
  const { error } = await supabase
    .from('users')
    .update({ group_id: newGroupId || null })
    .eq('id', req.params.id)
    .eq('role', 'student');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.put('/api/students/:id/pay', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { nextPaymentDate } = req.body;
  const nextDate = nextPaymentDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const { error } = await supabase
    .from('users')
    .update({ is_paid: true, payment_due_date: nextDate })
    .eq('id', req.params.id)
    .eq('role', 'student');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.put('/api/students/:id/payment-date', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { paymentDueDate, isPaid } = req.body;
  const { error } = await supabase
    .from('users')
    .update({ payment_due_date: paymentDueDate, is_paid: Boolean(isPaid) })
    .eq('id', req.params.id)
    .eq('role', 'student');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/users/:id', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { error } = await supabase.from('users').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ==========================================
// 8. DAVOMAT VA TELEGRAM BOT
// ==========================================
app.post('/api/attendance', authenticate, checkConfig, async (req, res) => {
  try {
    const { groupId, studentId, status } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('attendance')
      .upsert(
        {
          group_id: groupId,
          student_id: studentId,
          teacher_id: req.user.id !== 'super_admin' ? req.user.id : null,
          attendance_date: today,
          status: Boolean(status)
        },
        { onConflict: 'group_id,student_id,attendance_date' }
      );

    if (error) throw error;

    let telegramSent = false;
    if (status === false) {
      const [{ data: student }, { data: group }] = await Promise.all([
        supabase.from('users').select('full_name, parent_telegram_chat_id').eq('id', studentId).single(),
        supabase.from('groups').select('name, lesson_time').eq('id', groupId).single()
      ]);

      if (student?.parent_telegram_chat_id) {
        const msg =
          `⚠️ <b>DAVOMAT XABARNOMASI (EduAI)</b>\n\n` +
          `Hurmatli ota-ona! Farzandingiz <b>${student.full_name}</b> bugun (${today}) <b>"${group?.name || 'Dars'}"</b> mashg'ulotiga kelmadi.\n` +
          `🕒 Dars vaqti: ${group?.lesson_time || ''}`;
        telegramSent = await sendTelegramMessage(student.parent_telegram_chat_id, msg);
      }
    }

    res.json({ ok: true, telegramSent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trigger-payment-check', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const count = await checkAndNotifyOverduePayments();
  res.json({ message: `Tekshiruv yakunlandi. ${count} ta ota-onaga Telegram xabar yuborildi.` });
});

// ==========================================
// 9. AI LESSONS & QUIZ
// ==========================================
app.post('/api/lessons/generate', aiLimiter, authenticate, checkConfig, upload.single('file'), async (req, res) => {
  try {
    if (!ai) return res.status(500).json({ error: 'GEMINI_API_KEY kiritilmagan!' });
    const { text, title, instruction, language = "O'zbek tili" } = req.body;

    if (!instruction || !String(instruction).trim()) {
      return res.status(400).json({ error: 'Iltimos, AI uchun izoh (ko‘rsatma) kiriting!' });
    }

    const contents = [];
    if (req.file) {
      contents.push({ inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } });
    }
    if (text && String(text).trim()) {
      contents.push(`Asosiy matn:\n${String(text).trim().slice(0, 30000)}`);
    }
    if (contents.length === 0) return res.status(400).json({ error: 'PDF, rasm yoki matn yuboring' });

    contents.push(`
Foydalanuvchi ko'rsatmasi: "${String(instruction).trim().slice(0, 1000)}"
Natija tili: ${language}
FAQAT "${language}" tilida ta'limiy paket yarat: title, summary (5-7 ta), flashcards (6 ta q, a), quiz (5 ta question, options, correctIndex, explanation), podcast_script (Ali va Laylo).
`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.ARRAY, items: { type: Type.STRING } },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { q: { type: Type.STRING }, a: { type: Type.STRING } },
                required: ['q', 'a']
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctIndex', 'explanation']
              }
            },
            podcast_script: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { speaker: { type: Type.STRING }, text: { type: Type.STRING } },
                required: ['speaker', 'text']
              }
            }
          },
          required: ['title', 'summary', 'flashcards', 'quiz', 'podcast_script']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    const enrichedFlashcards = parsed.flashcards.map((fc, idx) => ({ id: idx + 1, ...fc, interval: 1 }));

    const { data: savedLesson, error } = await supabase
      .from('lessons')
      .insert({
        creator_id: req.user.id !== 'super_admin' ? req.user.id : null,
        group_id: null,
        title: title?.trim().slice(0, 200) || parsed.title,
        summary: parsed.summary,
        flashcards: enrichedFlashcards,
        quiz: parsed.quiz,
        podcast_script: parsed.podcast_script
      })
      .select()
      .single();

    if (error) throw error;
    res.json(savedLesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lessons', authenticate, checkConfig, async (req, res) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('creator_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/quiz/submit', authenticate, checkConfig, async (req, res) => {
  try {
    const { lessonId, scorePercent, wrongIndices, tabSwitches } = req.body;
    const safeScore = Math.max(0, Math.min(100, Number(scorePercent) || 0));

    await supabase.from('quiz_attempts').insert({
      student_id: req.user.id,
      lesson_id: lessonId,
      score_percent: safeScore,
      wrong_question_indices: Array.isArray(wrongIndices) ? wrongIndices : [],
      tab_switches: Math.max(0, Number(tabSwitches) || 0)
    });

    const earnedXp = Math.round(safeScore * 1.5);
    const { data: user } = await supabase.from('users').select('xp_points').eq('id', req.user.id).single();
    const newXp = (user?.xp_points || 0) + earnedXp;
    await supabase.from('users').update({ xp_points: newXp }).eq('id', req.user.id);
    res.json({ earnedXp, totalXp: newXp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. STATIC BUILD & SERVER START
// ==========================================
const clientDistPath = path.join(__dirname, '../eduai-client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`EduAI Server 0.0.0.0:${PORT} da ishga tushdi`);
});
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

// To'lov holatini hisoblash (Yashil / 3 kundan kam Sariq / Muddati o'tgan Qizil)
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

// Muddati o'tgan (qizil) o'quvchilarga avtomatik xabar yuborish funksiyasi
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

// Har 6 soatda avtomatik tekshiruv
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

const requireAdminOrOwner = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'center_owner') {
    return res.status(403).json({ error: 'Faqat Admin yoki O‘quv markaz egasi uchun!' });
  }
  next();
};

const requireTeacher = (req, res, next) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ error: 'Faqat O‘qituvchi uchun!' });
  }
  next();
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', port: process.env.PORT || 5000 });
});

// ==========================================
// 4. YAGONA AUTH (REGISTER + LOGIN + GOOGLE ADMIN)
// ==========================================
app.get('/api/public/groups', checkConfig, async (req, res) => {
  const { data: branches } = await supabase.from('branches').select('id, name');
  const { data: groups } = await supabase.from('groups').select('id, name, price, lesson_days, lesson_time, branch_id');
  const bMap = Object.fromEntries((branches || []).map(b => [b.id, b.name]));
  res.json((groups || []).map(g => ({
    ...g,
    branchName: bMap[g.branch_id] || 'Asosiy filial'
  })));
});

app.post('/api/auth/register', loginLimiter, checkConfig, async (req, res) => {
  try {
    const { fullName, username, password, role, subject, groupId, parentTelegramChatId } = req.body;
    const allowedRoles = ['student', 'teacher', 'center_owner', 'admin'];
    if (!fullName?.trim() || !username?.trim() || !password || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Barcha majburiy maydonlarni to‘ldiring' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const passwordHash = await bcrypt.hash(String(password), 10);
    const defaultDueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        role,
        full_name: fullName.trim().slice(0, 120),
        subject: role === 'teacher' ? (subject?.trim() || 'Umumiy fan') : null,
        username: cleanUsername,
        password_hash: passwordHash,
        group_id: role === 'student' && groupId ? groupId : null,
        payment_due_date: role === 'student' ? defaultDueDate : null,
        is_paid: false,
        parent_telegram_chat_id: role === 'student' && parentTelegramChatId ? String(parentTelegramChatId).trim() : null,
        is_active: true
      })
      .select('id, full_name, subject, username, role, group_id, xp_points, streak_days, avatar_url')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Bu login allaqachon band!' });
      throw error;
    }

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
        xp: user.xp_points || 0,
        streak: user.streak_days || 1,
        avatarUrl: user.avatar_url
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

app.post('/api/auth/google-admin', loginLimiter, async (req, res) => {
  try {
    if (!googleClient) return res.status(500).json({ error: 'GOOGLE_CLIENT_ID kiritilmagan!' });
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || payload.email.toLowerCase() !== (process.env.ADMIN_EMAIL || '').toLowerCase()) {
      return res.status(403).json({ error: 'Ushbu Google akkauntga Admin ruxsati berilmagan!' });
    }
    const token = jwt.sign({ id: 'super_admin', role: 'admin', email: payload.email }, getJwtSecret(), { expiresIn: '7d' });
    res.json({ token, user: { id: 'super_admin', fullName: payload.name || 'Super Admin', username: payload.email, role: 'admin', avatarUrl: payload.picture } });
  } catch (err) {
    res.status(401).json({ error: 'Google xatosi: ' + err.message });
  }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  if (supabase && req.user.id !== 'super_admin') {
    await supabase.from('users').update({ is_online: false }).eq('id', req.user.id);
  }
  res.json({ ok: true });
});

// ==========================================
// 5. MAHALLA -> UY -> XONA (MARKAZ EGASI / ADMIN / O'QITUVCHI / O'QUVCHI DATA)
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

    const teachers = (users || []).filter(u => u.role === 'teacher');
    const students = (users || []).filter(u => u.role === 'student');
    const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));
    const todayAttendance = (attendance || []).filter(a => a.attendance_date === today);

    const enrichedGroups = (groups || []).map(g => {
      const grpStudents = students.filter(s => s.group_id === g.id);
      const grpTodayAtt = todayAttendance.filter(a => a.group_id === g.id);
      // Agar guruhda o'quvchilar bo'lsa va bugun davomat olinmagan bo'lsa -> QIZIL ogohlantirish
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

    const enrichedTeachers = teachers.map(t => {
      const assignedGroups = enrichedGroups.filter(
        g => g.teacher_id === t.id || g.substitute_teacher_id === t.id
      );
      return {
        ...t,
        assignedGroups
      };
    });

    res.json({
      branches: branches || [],
      groups: enrichedGroups,
      teachers: enrichedTeachers,
      students: enrichedStudents,
      attendance: attendance || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Filial qo'shish (Mahalla)
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

// Filialni o'chirish
app.delete('/api/branches/:id', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { error } = await supabase.from('branches').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Guruh ochish (Faqat Admin va O'quv markaz egasi - O'qituvchi ocha olmaydi!)
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

// Guruhni o'chirish
app.delete('/api/groups/:id', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { error } = await supabase.from('groups').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// O'qituvchini vaqtincha boshqa guruhga ulash / almashtirish
app.put('/api/groups/:id/substitute', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { substituteTeacherId } = req.body;
  const { error } = await supabase
    .from('groups')
    .update({ substitute_teacher_id: substituteTeacherId || null })
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// O'quvchini guruhga yozish / To'lov sanasi va ota-ona Telegram ID belgilash
app.put('/api/students/:id/enroll', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { groupId, paymentDueDate, parentTelegramChatId } = req.body;
  const updatePayload = {
    group_id: groupId || null,
    is_paid: false
  };
  if (paymentDueDate) updatePayload.payment_due_date = paymentDueDate;
  if (parentTelegramChatId !== undefined) {
    updatePayload.parent_telegram_chat_id = String(parentTelegramChatId).trim() || null;
  }

  const { error } = await supabase.from('users').update(updatePayload).eq('id', req.params.id).eq('role', 'student');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// O'quvchini boshqa guruhga transfer qilish
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

// To'lov qildi tick (Keyingi sanani +30 kunga suradi va is_paid = true qiladi)
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

// To'lov sanasini qo'lda tahrirlash (Sariq/Qizil test va boshqaruv uchun)
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

// O'qituvchi yoki o'quvchini tizimdan o'chirish
app.delete('/api/users/:id', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const { error } = await supabase.from('users').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ==========================================
// 6. DAVOMAT VA TELEGRAM BOT XABARLARI
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

    // Agar o'quvchi kelmasa (status === false) -> ota-onasi Telegramiga xabar yuborish
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

// Qizil to'lovlarni qo'lda tekshirish tugmasi
app.post('/api/trigger-payment-check', authenticate, requireAdminOrOwner, checkConfig, async (req, res) => {
  const count = await checkAndNotifyOverduePayments();
  res.json({ message: `Tekshiruv yakunlandi. ${count} ta ota-onaga Telegram xabar yuborildi.` });
});

// ==========================================
// 7. OLDINGI AI DARSLAR, TESTLAR VA TRACKER (SAQLANGAN!)
// ==========================================
// Eslatma: O'qituvchining guruhga AI uyga vazifa yuborishi (groupId) olib tashlandi!
app.post('/api/lessons/generate', aiLimiter, authenticate, checkConfig, upload.single('file'), async (req, res) => {
  try {
    if (!ai) return res.status(500).json({ error: 'GEMINI_API_KEY kiritilmagan!' });
    const { text, title, instruction, language = "O'zbek tili" } = req.body;

    if (!instruction || !String(instruction).trim()) {
      return res.status(400).json({ error: 'Iltimos, AI uchun izoh (ko‘rsatma) kiriting!' });
    }

    const contents = [];
    if (req.file) {
      contents.push({
        inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype }
      });
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
        group_id: null, // Guruhga uyga vazifa yuborish olib tashlangan
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
// 8. STATIC BUILD & SERVER START
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
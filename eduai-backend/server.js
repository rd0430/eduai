import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token topilmadi' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token yaroqsiz' });
  }
};

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Faqat Super Admin uchun ruxsat etilgan' });
  }
  next();
};

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'EduAI Backend ishlamoqda!' });
});

// =========================================================
// 1. GOOGLE OAUTH (SUPER ADMIN KIRISHI)
// =========================================================
app.post('/api/auth/google-admin', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.email || payload.email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: 'Ushbu Google akkauntga Admin ruxsati berilmagan!' });
    }

    const token = jwt.sign(
      { id: 'super_admin', role: 'admin', email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: 'super_admin',
        fullName: payload.name || 'Super Admin',
        username: payload.email,
        role: 'admin',
        avatar: payload.picture
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Google autentifikatsiya xatosi: ' + err.message });
  }
});

// =========================================================
// 2. ODDIY LOGIN (O'QITUVCHI VA O'QUVCHI)
// =========================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.trim().toLowerCase())
      .eq('role', role)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Login yoki rol xato' });
    if (!user.is_active) return res.status(403).json({ error: 'Akkauntingiz Admin tomonidan vaqtincha bloklangan' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Parol noto‘g‘ri' });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let streak = user.streak_days || 0;

    if (user.last_active_date !== today) {
      streak = user.last_active_date === yesterday ? streak + 1 : 1;
    }

    await supabase
      .from('users')
      .update({ last_active_date: today, streak_days: streak, is_online: true, last_seen: new Date().toISOString() })
      .eq('id', user.id);

    const token = jwt.sign(
      { id: user.id, role: user.role, group_id: user.group_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
        streak
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  if (req.user.id !== 'super_admin') {
    await supabase.from('users').update({ is_online: false }).eq('id', req.user.id);
  }
  res.json({ ok: true });
});

// =========================================================
// 3. SUPER ADMIN PANEL ENDPOINTLARI
// =========================================================
app.get('/api/admin/overview', authenticate, requireAdmin, async (req, res) => {
  const { data: teachers } = await supabase
    .from('users')
    .select('id, full_name, subject, username, is_active, ai_requests_count, is_online, created_at')
    .eq('role', 'teacher')
    .order('created_at', { ascending: false });

  const { count: studentCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student');

  const { count: groupCount } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true });

  const { count: lessonCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true });

  const { data: announcement } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  res.json({
    teachers: teachers || [],
    stats: {
      totalTeachers: teachers?.length || 0,
      totalStudents: studentCount || 0,
      totalGroups: groupCount || 0,
      totalLessons: lessonCount || 0
    },
    activeAnnouncement: announcement || null
  });
});

app.post('/api/admin/teachers', authenticate, requireAdmin, async (req, res) => {
  try {
    const { fullName, subject } = req.body;
    const cleanName = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'ustoz';
    const username = `ustoz_${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
    const plainPassword = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const { data: teacher, error } = await supabase
      .from('users')
      .insert({
        role: 'teacher',
        full_name: fullName.trim(),
        subject: subject?.trim() || 'Umumiy fan',
        username,
        password_hash: passwordHash,
        is_active: true
      })
      .select()
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

app.patch('/api/admin/teachers/:id/toggle-status', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { data: current } = await supabase.from('users').select('is_active').eq('id', id).single();
  const { data: updated } = await supabase
    .from('users')
    .update({ is_active: !current.is_active })
    .eq('id', id)
    .select()
    .single();
  res.json(updated);
});

app.post('/api/admin/teachers/:id/reset-password', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const plainPassword = String(Math.floor(100000 + Math.random() * 900000));
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const { data: teacher } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', id)
    .select('full_name, username')
    .single();

  res.json({ fullName: teacher.full_name, username: teacher.username, plainPassword });
});

app.post('/api/admin/announcements', authenticate, requireAdmin, async (req, res) => {
  const { message } = req.body;
  await supabase.from('announcements').update({ is_active: false }).eq('is_active', true);

  if (!message?.trim()) return res.json({ announcement: null });

  const { data } = await supabase
    .from('announcements')
    .insert({ message: message.trim(), is_active: true })
    .select()
    .single();

  res.json({ announcement: data });
});

app.get('/api/announcement/active', authenticate, async (req, res) => {
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  res.json(data || null);
});

// =========================================================
// 4. AI GENERATOR: PDF / RASM / MATN -> DARS + PODKAST
// =========================================================
app.post('/api/lessons/generate', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { text, title, groupId } = req.body;
    const contents = [];

    if (req.file) {
      contents.push({
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
        }
      });
    } else if (text) {
      contents.push(text);
    } else {
      return res.status(400).json({ error: 'PDF, rasm yoki matn yuboring' });
    }

    contents.push(`
      Ushbu material asosida o'zbek tilida ta'limiy paket yarat:
      1. title: Mavzu nomi.
      2. summary: 5-7 ta muhim asosiy g'oya.
      3. flashcards: Kamida 6 ta savol-javob (q, a).
      4. quiz: Kamida 5 ta 4 variantli test (question, options [4 ta], correctIndex [0-3], explanation).
      5. podcast_script: Ikki boshlovchi ("Ali" va "Laylo") o'rtasida mavzuni sodda tushuntiruvchi 6-8 replikadan iborat dialog.
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
    const enrichedFlashcards = parsed.flashcards.map((fc, idx) => ({
      id: idx + 1,
      ...fc,
      interval: 1
    }));

    const { data: savedLesson, error } = await supabase
      .from('lessons')
      .insert({
        creator_id: req.user.id,
        group_id: groupId || null,
        title: title || parsed.title,
        summary: parsed.summary,
        flashcards: enrichedFlashcards,
        quiz: parsed.quiz,
        podcast_script: parsed.podcast_script
      })
      .select()
      .single();

    if (error) throw error;

    const { data: u } = await supabase.from('users').select('ai_requests_count').eq('id', req.user.id).single();
    await supabase.from('users').update({ ai_requests_count: (u?.ai_requests_count || 0) + 1 }).eq('id', req.user.id);

    res.json(savedLesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lessons', authenticate, async (req, res) => {
  let query = supabase.from('lessons').select('*').order('created_at', { ascending: false });
  if (req.user.role === 'student') {
    query = query.or(`creator_id.eq.${req.user.id},group_id.eq.${req.user.group_id}`);
  } else {
    query = query.eq('creator_id', req.user.id);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// =========================================================
// 5. AI REPETITOR, WEAKNESS DETECTOR, QUIZ & TRACKER
// =========================================================
app.post('/api/ai/tutor', authenticate, async (req, res) => {
  try {
    const { question, options, userAnswerIndex, correctIndex } = req.body;
    const prompt = `
      Savol: "${question}"
      Variantlar: ${options.map((o, i) => `${i + 1}) ${o}`).join(', ')}
      O'quvchi tanlagan xato javob: "${options[userAnswerIndex]}"
      To'g'ri javob: "${options[correctIndex]}"
      Nima uchun to'g'ri javob shunday ekanini 3-4 gapda, kundalik hayotdan olingan juda oddiy misol bilan o'zbek tilida tushuntirib ber.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    res.json({ explanation: response.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/weakness-detector', authenticate, async (req, res) => {
  try {
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('wrong_question_indices, lessons(title, quiz)')
      .eq('student_id', req.user.id)
      .order('completed_at', { ascending: false })
      .limit(5);

    const wrongQuestions = [];
    (attempts || []).forEach(a => {
      (a.wrong_question_indices || []).forEach(idx => {
        if (a.lessons?.quiz?.[idx]) {
          wrongQuestions.push({ topic: a.lessons.title, question: a.lessons.quiz[idx].question });
        }
      });
    });

    if (wrongQuestions.length === 0) {
      return res.json({ analysis: 'Sizda hozircha xato qilingan savollar yo‘q. Ajoyib natija!' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `O'quvchining xato savollari: ${JSON.stringify(wrongQuestions)}. O'zbek tilida uning qaysi mavzularda qiynalayotganini qisqa tahlil qil va 2 ta tavsiya ber.`
    });
    res.json({ analysis: response.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quiz/submit', authenticate, async (req, res) => {
  try {
    const { lessonId, scorePercent, wrongIndices, tabSwitches } = req.body;
    await supabase.from('quiz_attempts').insert({
      student_id: req.user.id,
      lesson_id: lessonId,
      score_percent: scorePercent,
      wrong_question_indices: wrongIndices || [],
      tab_switches: tabSwitches || 0
    });

    const earnedXp = Math.round(scorePercent * 1.5);
    const { data: user } = await supabase.from('users').select('xp_points').eq('id', req.user.id).single();
    const newXp = (user?.xp_points || 0) + earnedXp;
    await supabase.from('users').update({ xp_points: newXp }).eq('id', req.user.id);
    res.json({ earnedXp, totalXp: newXp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tracker/ping', authenticate, async (req, res) => {
  try {
    const { seconds = 30 } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('study_logs')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('study_date', today)
      .single();

    let totalSeconds = seconds;
    if (existing) {
      totalSeconds = existing.seconds_spent + seconds;
      await supabase.from('study_logs').update({ seconds_spent: totalSeconds }).eq('id', existing.id);
    } else {
      await supabase.from('study_logs').insert({ student_id: req.user.id, study_date: today, seconds_spent: seconds });
    }

    await supabase.from('users').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', req.user.id);
    res.json({ minutesToday: Math.floor(totalSeconds / 60) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// 6. O'QITUVCHI PANELI ENDPOINTLARI
// =========================================================
app.get('/api/teacher/groups', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('teacher_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/teacher/groups', authenticate, async (req, res) => {
  const { name } = req.body;
  const { data, error } = await supabase.from('groups').insert({ teacher_id: req.user.id, name }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/teacher/groups/:groupId/students', authenticate, async (req, res) => {
  try {
    const { fullName } = req.body;
    const { groupId } = req.params;
    const cleanFirst = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'student';
    const username = `${cleanFirst}_${Math.floor(100 + Math.random() * 900)}`;
    const plainPassword = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const { data: student, error } = await supabase
      .from('users')
      .insert({
        role: 'student',
        full_name: fullName.trim(),
        username,
        password_hash: passwordHash,
        group_id: groupId
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ id: student.id, fullName: student.full_name, username, plainPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/teacher/groups/:groupId/dashboard', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const { data: students } = await supabase
      .from('users')
      .select('id, full_name, username, xp_points, streak_days, is_online, last_seen')
      .eq('group_id', groupId);

    const studentIds = (students || []).map(s => s.id);
    const { data: logs } = await supabase
      .from('study_logs')
      .select('student_id, seconds_spent')
      .in('student_id', studentIds)
      .eq('study_date', today);

    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('student_id, score_percent, tab_switches, wrong_question_indices')
      .in('student_id', studentIds);

    const enrichedStudents = (students || []).map(st => {
      const log = (logs || []).find(l => l.student_id === st.id);
      const stAttempts = (attempts || []).filter(a => a.student_id === st.id);
      const avgScore = stAttempts.length
        ? Math.round(stAttempts.reduce((sum, a) => sum + a.score_percent, 0) / stAttempts.length)
        : 0;
      const totalCheats = stAttempts.reduce((sum, a) => sum + (a.tab_switches || 0), 0);
      const isLive = st.is_online && (Date.now() - new Date(st.last_seen).getTime() < 120000);

      return {
        ...st,
        isOnline: isLive,
        minutesToday: Math.floor((log?.seconds_spent || 0) / 60),
        avgScore,
        cheatWarnings: totalCheats
      };
    });

    const leaderboard = [...enrichedStudents].sort((a, b) => b.xp_points - a.xp_points).slice(0, 5);
    const errorMap = {};
    (attempts || []).forEach(a => {
      (a.wrong_question_indices || []).forEach(idx => {
        errorMap[idx] = (errorMap[idx] || 0) + 1;
      });
    });

    const heatmap = Object.entries(errorMap).map(([qIdx, count]) => ({
      questionNumber: Number(qIdx) + 1,
      errorCount: count,
      errorRate: attempts?.length ? Math.round((count / attempts.length) * 100) : 0
    }));

    res.json({ students: enrichedStudents, leaderboard, heatmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/teacher/groups/:groupId/export-csv', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const { data: students } = await supabase
    .from('users')
    .select('full_name, username, xp_points, streak_days')
    .eq('group_id', groupId);

  const header = 'Ism-Familiya,Login,XP Ball,Streak (kun)\n';
  const rows = (students || [])
    .map(s => `"${s.full_name}",${s.username},${s.xp_points},${s.streak_days}`)
    .join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="guruh_${groupId}_hisobot.csv"`);
  res.send('\uFEFF' + header + rows);
});

// =========================================================
// 7. FRONTEND STATIC SERVE (PRODUCTION / RAILWAY)
// =========================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.join(__dirname, '../eduai-client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'EduAI Backend ishlamoqda!' });
  });
}

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`EduAI Server 0.0.0.0:${PORT} da ishga tushdi`);
});
import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
  BookOpen, Upload, FileText, CheckCircle2, XCircle, Sparkles,
  Users, Plus, Copy, Check, Clock, Flame, Trophy, Volume2, Square,
  AlertTriangle, Download, LogOut, BarChart3, Send, ShieldAlert,
  ShieldCheck, KeyRound, Ban, Megaphone, Cpu, X, Camera, Lock, Menu,
  Calculator, Moon, Sun, ExternalLink
} from 'lucide-react';
import StudyTools from './StudyTools';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function EduAIApp() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('eduai_dark_mode') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('eduai_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  const [token, setToken] = useState(localStorage.getItem('eduai_token') || '');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('eduai_user') || 'null'));
  const [announcement, setAnnouncement] = useState(null);

  const [authRole, setAuthRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin states
  const [adminData, setAdminData] = useState({ teachers: [], stats: {}, activeAnnouncement: null });
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('');
  const [generatedTeacherCreds, setGeneratedTeacherCreds] = useState(null);
  const [announcementInput, setAnnouncementInput] = useState('');

  // Student lesson & quiz states
  const [activeNav, setActiveNav] = useState('new');
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [lessonInstruction, setLessonInstruction] = useState('');
  const [lessonLanguage, setLessonLanguage] = useState("O'zbek tili");
  const [loadingAI, setLoadingAI] = useState(false);

  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [answers, setAnswers] = useState({});
  const [tutorExplanations, setTutorExplanations] = useState({});
  const [loadingTutor, setLoadingTutor] = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [weaknessReport, setWeaknessReport] = useState('');
  const [minutesToday, setMinutesToday] = useState(0);

  // Teacher states
  const [teacherView, setTeacherView] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [groupStats, setGroupStats] = useState({ students: [], leaderboard: [], heatmap: [] });
  const [assignTitle, setAssignTitle] = useState('');
  const [assignText, setAssignText] = useState('');
  const [assignInstruction, setAssignInstruction] = useState('');
  const [assignLanguage, setAssignLanguage] = useState("O'zbek tili");

  // Mobile Menu & Profile Modal states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const apiFetch = async (endpoint, options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
    return data;
  };

  useEffect(() => {
    if (!token || user?.role !== 'student') return;

    const handleVisibility = () => {
      if (document.hidden && activeTab === 'quiz' && currentLesson && !quizSubmitted) {
        setTabSwitches(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(async () => {
      if (!document.hidden) {
        try {
          const res = await apiFetch('/tracker/ping', {
            method: 'POST',
            body: JSON.stringify({ seconds: 30 })
          });
          setMinutesToday(res.minutesToday);
        } catch {}
      }
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [token, user, activeTab, currentLesson, quizSubmitted]);

  useEffect(() => {
    if (!token || !user) return;
    apiFetch('/announcement/active').then(setAnnouncement).catch(() => {});

    if (user.role === 'admin') {
      loadAdminOverview();
    } else if (user.role === 'student') {
      apiFetch('/lessons').then(setLessons).catch(console.error);
    } else if (user.role === 'teacher') {
      apiFetch('/teacher/groups').then(data => {
        setGroups(data);
        if (data[0]) loadGroupDashboard(data[0]);
      });
    }
  }, [token, user]);

  const ThemeToggleBtn = ({ compact = false }) => (
    <button
      type="button"
      onClick={() => setDarkMode(prev => !prev)}
      className={`flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition ${
        compact ? 'p-2' : 'px-3 py-2 text-xs sm:text-sm font-semibold'
      }`}
      title={darkMode ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
    >
      {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
      {!compact && <span>{darkMode ? 'Yorug‘' : 'Tungi'}</span>}
    </button>
  );

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${API_URL}/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rasm yuklashda xatolik');

      const updatedUser = { ...user, avatarUrl: data.avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('eduai_user', JSON.stringify(updatedUser));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChangeOwnPassword = async (e) => {
    e.preventDefault();
    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 4) {
      alert("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    setPasswordChangeLoading(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          oldPassword: oldPasswordInput,
          newPassword: newPasswordInput.trim()
        })
      });
      alert('Parolingiz muvaffaqiyatli yangilandi!');
      setOldPasswordInput('');
      setNewPasswordInput('');
      setShowProfileModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleResetStudentPassword = async (studentId, studentName) => {
    const custom = window.prompt(
      `${studentName} uchun yangi parol yozing (avtomatik 6 xonali parol uchun bo'sh qoldirib OK bosing):`
    );
    if (custom === null) return;

    try {
      const data = await apiFetch(`/teacher/students/${studentId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ customPassword: custom }),
      });

      setGeneratedCreds({
        fullName: data.fullName,
        username: data.username,
        plainPassword: data.plainPassword
      });

      alert(`Yangi parol yaratildi (faqat bir marta ko'rsatiladi):\nLogin: ${data.username}\nParol: ${data.plainPassword}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadCsv = async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`${API_URL}/teacher/groups/${selectedGroup.id}/export-csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Hisobotni yuklashda xatolik');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guruh_${selectedGroup.name}_hisobot.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, role: authRole })
      });
      localStorage.setItem('eduai_token', data.token);
      localStorage.setItem('eduai_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleGoogleAdminSuccess = async (credentialResponse) => {
    setAuthError('');
    try {
      const data = await apiFetch('/auth/google-admin', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      localStorage.setItem('eduai_token', data.token);
      localStorage.setItem('eduai_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('eduai_token');
    localStorage.removeItem('eduai_user');
    setToken('');
    setUser(null);
    setMobileMenuOpen(false);
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadAdminOverview = async () => {
    const data = await apiFetch('/admin/overview');
    setAdminData(data);
    setAnnouncementInput(data.activeAnnouncement?.message || '');
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;
    try {
      const creds = await apiFetch('/admin/teachers', {
        method: 'POST',
        body: JSON.stringify({ fullName: newTeacherName, subject: newTeacherSubject })
      });
      setGeneratedTeacherCreds(creds);
      setNewTeacherName('');
      setNewTeacherSubject('');
      loadAdminOverview();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleToggleTeacher = async (teacherId) => {
    await apiFetch(`/admin/teachers/${teacherId}/toggle-status`, { method: 'PATCH' });
    loadAdminOverview();
  };

  const handleResetTeacherPassword = async (teacherId) => {
    const creds = await apiFetch(`/admin/teachers/${teacherId}/reset-password`, { method: 'POST' });
    setGeneratedTeacherCreds(creds);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    await apiFetch('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({ message: announcementInput })
    });
    loadAdminOverview();
    alert('Global e’lon yangilandi!');
  };

  const handleGenerateLesson = async (targetGroupId = null) => {
    const activeInstruction = targetGroupId ? assignInstruction : lessonInstruction;
    const activeLanguage = targetGroupId ? assignLanguage : lessonLanguage;
    const activeText = targetGroupId ? assignText : inputText;

    if (!activeInstruction.trim()) {
      alert('Iltimos, AI uchun izoh (ko‘rsatma) yozing! Bu maydon majburiy.');
      return;
    }

    if (!targetGroupId && !selectedFile && !activeText.trim()) {
      alert('Iltimos, kamida bitta PDF, rasm yoki dars matnini kiriting!');
      return;
    }

    if (targetGroupId && !activeText.trim()) {
      alert('Iltimos, vazifa matnini kiriting!');
      return;
    }

    setLoadingAI(true);
    try {
      const formData = new FormData();
      if (!targetGroupId && selectedFile) formData.append('file', selectedFile);
      formData.append('instruction', activeInstruction.trim());
      formData.append('language', activeLanguage);

      if (targetGroupId) {
        formData.append('text', assignText);
        formData.append('title', assignTitle);
        formData.append('groupId', targetGroupId);
      } else {
        formData.append('text', inputText);
      }

      const lesson = await apiFetch('/lessons/generate', { method: 'POST', body: formData });
      if (targetGroupId) {
        alert(`"${lesson.title}" vazifasi guruhga yuborildi!`);
        setAssignTitle('');
        setAssignText('');
        setAssignInstruction('');
      } else {
        setLessons(prev => [lesson, ...prev]);
        setLessonInstruction('');
        setSelectedFile(null);
        setInputText('');
        openLesson(lesson);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const openLesson = (lesson) => {
    setCurrentLesson(lesson);
    setActiveTab('summary');
    setCardIndex(0);
    setFlipped(false);
    setAnswers({});
    setTutorExplanations({});
    setTabSwitches(0);
    setQuizSubmitted(false);
  };

  const handleRateFlashcard = (rating) => {
    const updated = [...currentLesson.flashcards];
    if (rating === 1) updated.push({ ...updated[cardIndex] });
    setCurrentLesson({ ...currentLesson, flashcards: updated });
    setFlipped(false);
    setCardIndex((prev) => (prev + 1) % updated.length);
  };

  const askAiTutor = async (qIdx, qObj, chosenIdx) => {
    setLoadingTutor(qIdx);
    try {
      const res = await apiFetch('/ai/tutor', {
        method: 'POST',
        body: JSON.stringify({
          question: qObj.question,
          options: qObj.options,
          userAnswerIndex: chosenIdx,
          correctIndex: qObj.correctIndex
        })
      });
      setTutorExplanations(prev => ({ ...prev, [qIdx]: res.explanation }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingTutor(null);
    }
  };

  const submitQuiz = async () => {
    const quiz = currentLesson.quiz;
    let correct = 0;
    const wrongIndices = [];
    quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct++;
      else wrongIndices.push(idx);
    });

    const scorePercent = Math.round((correct / quiz.length) * 100);
    const res = await apiFetch('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ lessonId: currentLesson.id, scorePercent, wrongIndices, tabSwitches })
    });
    setUser(prev => ({ ...prev, xp: res.totalXp }));
    setQuizSubmitted(true);
  };

  const playPodcast = () => {
    window.speechSynthesis.cancel();
    (currentLesson.podcast_script || []).forEach(line => {
      const u = new SpeechSynthesisUtterance(line.text);
      u.lang = 'uz-UZ';
      u.pitch = line.speaker === 'Ali' ? 0.9 : 1.25;
      window.speechSynthesis.speak(u);
    });
  };

  const loadGroupDashboard = async (group) => {
    setSelectedGroup(group);
    setTeacherView('groups');
    setMobileMenuOpen(false);
    const stats = await apiFetch(`/teacher/groups/${group.id}/dashboard`);
    setGroupStats(stats);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const grp = await apiFetch('/teacher/groups', { method: 'POST', body: JSON.stringify({ name: newGroupName }) });
    setGroups([grp, ...groups]);
    setNewGroupName('');
    loadGroupDashboard(grp);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedGroup) return;
    const creds = await apiFetch(`/teacher/groups/${selectedGroup.id}/students`, {
      method: 'POST',
      body: JSON.stringify({ fullName: newStudentName })
    });
    setGeneratedCreds(creds);
    setNewStudentName('');
    loadGroupDashboard(selectedGroup);
  };

  // ==========================================
  // 1. LOGIN SCREEN
  // ==========================================
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggleBtn />
        </div>

        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-2xl mb-6">
            <BookOpen className="w-8 h-8" /> EduAI
          </div>

          <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl mb-6">
            {[
              { id: 'student', label: 'O‘quvchi' },
              { id: 'teacher', label: 'O‘qituvchi' },
              { id: 'admin', label: 'Admin' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => { setAuthRole(r.id); setAuthError(''); }}
                className={`py-2.5 rounded-lg text-xs font-semibold transition ${
                  authRole === r.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {authRole === 'admin' ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-600">
                Super Admin paneliga faqat ruxsat etilgan <b>Google (Gmail)</b> akkaunt orqali kirish mumkin.
              </p>
              <div className="flex justify-center pt-2">
                <GoogleLogin
                  onSuccess={handleGoogleAdminSuccess}
                  onError={() => setAuthError('Google orqali kirish bekor qilindi')}
                />
              </div>
              {authError && <p className="text-red-500 text-xs mt-2">{authError}</p>}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder={authRole === 'teacher' ? 'Login (masalan: ustoz_ali_412)' : 'Login (masalan: ali_482)'}
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                required
              />
              <input
                type="password"
                placeholder="Parol"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                required
              />
              {authError && <p className="text-red-500 text-xs">{authError}</p>}
              <button className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition">
                Tizimga kirish
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ADMIN PANEL
  // ==========================================
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sm:py-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 shrink-0" />
            <div className="truncate">
              <h1 className="font-bold text-slate-800 text-base sm:text-lg truncate">EduAI — Super Admin</h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggleBtn compact />
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-red-600 shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-red-50">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'O‘qituvchilar', val: adminData.stats.totalTeachers || 0, icon: Users },
              { label: 'Guruhlar', val: adminData.stats.totalGroups || 0, icon: BookOpen },
              { label: 'O‘quvchilar', val: adminData.stats.totalStudents || 0, icon: Trophy },
              { label: 'AI Darslar', val: adminData.stats.totalLessons || 0, icon: Cpu }
            ].map((s, i) => (
              <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{s.val}</p>
                </div>
                <s.icon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 bg-blue-50 p-1.5 rounded-xl shrink-0" />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="font-bold text-slate-800 text-sm sm:text-base">Yangi O‘qituvchi Qo‘shish</h2>
              <form onSubmit={handleCreateTeacher} className="space-y-3">
                <input
                  type="text"
                  placeholder="O‘qituvchi Ism-Familiyasi (Alisher Karimov)"
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-base sm:text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Fani (masalan: Matematika / Fizika)"
                  value={newTeacherSubject}
                  onChange={e => setNewTeacherSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-base sm:text-sm"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm">
                  O‘qituvchi Akkaunti Yaratish
                </button>
              </form>

              {generatedTeacherCreds && (
                <div className="p-3.5 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm min-w-0">
                    <p className="font-bold text-slate-800 truncate">{generatedTeacherCreds.fullName}</p>
                    <p>Login: <span className="font-mono font-bold text-blue-700">{generatedTeacherCreds.username}</span></p>
                    <p>Bir martalik parol: <span className="font-mono font-bold text-blue-700">{generatedTeacherCreds.plainPassword}</span></p>
                  </div>
                  <button
                    onClick={() =>
                      copyText(
                        `EduAI Ustoz Paneli:\nLogin: ${generatedTeacherCreds.username}\nParol: ${generatedTeacherCreds.plainPassword}`,
                        'teacher_cred'
                      )
                    }
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedId === 'teacher_cred' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" /> Global E’lon
              </h2>
              <form onSubmit={handleSaveAnnouncement} className="space-y-3">
                <textarea
                  rows="3"
                  placeholder="Barcha foydalanuvchilarga ko‘rinadigan xabar (o‘chirish uchun bo‘sh qoldiring)..."
                  value={announcementInput}
                  onChange={e => setAnnouncementInput(e.target.value)}
                  className="w-full p-3 border rounded-xl text-base sm:text-sm"
                />
                <button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                  E’lonni Saqlash
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 font-bold text-slate-800 text-sm sm:text-base">
              Ro‘yxatdan o‘tgan O‘qituvchilar
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3.5 sm:p-4">O‘qituvchi</th>
                    <th className="p-3.5 sm:p-4">Fani</th>
                    <th className="p-3.5 sm:p-4">Login</th>
                    <th className="p-3.5 sm:p-4">AI Darslar</th>
                    <th className="p-3.5 sm:p-4">Holati</th>
                    <th className="p-3.5 sm:p-4">Boshqaruv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminData.teachers.map(t => (
                    <tr key={t.id}>
                      <td className="p-3.5 sm:p-4 font-semibold text-slate-800">{t.full_name}</td>
                      <td className="p-3.5 sm:p-4 text-slate-600">{t.subject}</td>
                      <td className="p-3.5 sm:p-4 font-mono text-blue-700">{t.username}</td>
                      <td className="p-3.5 sm:p-4 font-semibold">{t.ai_requests_count} ta</td>
                      <td className="p-3.5 sm:p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {t.is_active ? 'Faol' : 'Bloklangan'}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 flex gap-2">
                        <button
                          onClick={() => handleResetTeacherPassword(t.id)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Yangi parol
                        </button>
                        <button
                          onClick={() => handleToggleTeacher(t.id)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" /> {t.is_active ? 'Bloklash' : 'Ochish'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // 3. TEACHER PANEL (CHAP MENYU KOMPYUTERDA FIXED)
  // ==========================================
  if (user.role === 'teacher') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Mobil yuqori panel */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <BookOpen className="w-6 h-6" /> EduAI Ustoz
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggleBtn compact />
            <button
              onClick={() => { setTeacherView(teacherView === 'tools' ? 'groups' : 'tools'); setMobileMenuOpen(false); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                teacherView === 'tools' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
              }`}
            >
              <Calculator className="w-4 h-4" /> Jihozlar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobil fon qorayishi */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          />
        )}

        {/* CHAP YON MENYU (Kompyuterda fixed, telefonda drawer) */}
        <aside
          className={`${
            mobileMenuOpen ? 'flex' : 'hidden lg:flex'
          } fixed inset-y-0 left-0 z-40 w-72 lg:w-64 bg-white border-r border-slate-200 p-5 flex-col justify-between overflow-y-auto`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                <BookOpen className="w-6 h-6" /> EduAI Ustoz
              </div>
              <ThemeToggleBtn compact />
            </div>
            <p className="text-xs text-slate-500 mb-5 font-mono">Login: {user.username}</p>

            <button
              onClick={() => { setTeacherView('tools'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 mb-2 transition ${
                teacherView === 'tools' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" /> Jihozlar (Kalkulyator / Jadval)
            </button>

            <a
              href="https://peakmock.up.railway.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between mb-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 transition"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                Peakmock
              </span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>

            <form onSubmit={handleCreateGroup} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Guruh (Fizika 9-A)"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
              <button className="bg-blue-600 text-white p-2 rounded-lg shrink-0"><Plus className="w-4 h-4" /></button>
            </form>

            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Guruhlarim</p>
            <div className="space-y-1">
              {groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => loadGroupDashboard(g)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    teacherView === 'groups' && selectedGroup?.id === g.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" /> <span className="truncate">{g.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 text-slate-600 hover:text-blue-600 text-sm font-medium py-1"
            >
              <KeyRound className="w-4 h-4" /> Parolni o‘zgartirish
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm py-1">
              <LogOut className="w-4 h-4" /> Chiqish
            </button>
          </div>
        </aside>

        {/* ASOSIY KONTENT (lg:pl-64 bilan menyu yonida turadi) */}
        <div className="lg:pl-64 min-h-screen flex flex-col">
          {announcement && (
            <div className="bg-blue-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
              <Megaphone className="w-4 h-4 shrink-0" /> <span>{announcement.message}</span>
            </div>
          )}

          <main className="flex-1 p-4 sm:p-8 space-y-6 w-full">
            {teacherView === 'tools' ? (
              <StudyTools />
            ) : selectedGroup ? (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{selectedGroup.name} — Boshqaruv</h1>
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 w-full sm:w-auto cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-blue-600" /> CSV Hisobot
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200">
                    <h2 className="font-semibold text-slate-800 mb-3 text-sm sm:text-base">Yangi o‘quvchi qo‘shish</h2>
                    <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Ism-Familiya (Ali Valiyev)"
                        value={newStudentName}
                        onChange={e => setNewStudentName(e.target.value)}
                        className="flex-1 px-4 py-2.5 border rounded-xl text-base sm:text-sm"
                      />
                      <button className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">Yaratish</button>
                    </form>

                    {generatedCreds && (
                      <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="text-xs sm:text-sm min-w-0">
                          <p className="font-bold text-slate-800 truncate">{generatedCreds.fullName}</p>
                          <p>Login: <span className="font-mono font-bold text-blue-700">{generatedCreds.username}</span></p>
                          <p>Bir martalik parol: <span className="font-mono font-bold text-blue-700">{generatedCreds.plainPassword}</span></p>
                          <p className="text-[11px] text-slate-500 mt-0.5">* Xavfsizlik uchun parol bazada saqlanmaydi, nusxalab oling.</p>
                        </div>
                        <button
                          onClick={() =>
                            copyText(
                              `EduAI Kirish:\nLogin: ${generatedCreds.username}\nParol: ${generatedCreds.plainPassword}`,
                              'new'
                            )
                          }
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          {copiedId === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-3">
                    <h2 className="font-semibold text-slate-800 text-sm sm:text-base">Guruhga AI Uyga Vazifa yuborish</h2>
                    <input
                      type="text"
                      placeholder="Mavzu nomi"
                      value={assignTitle}
                      onChange={e => setAssignTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 border rounded-xl text-base sm:text-sm"
                    />
                    <textarea
                      rows="2"
                      placeholder="Dars matnini kiriting..."
                      value={assignText}
                      onChange={e => setAssignText(e.target.value)}
                      className="w-full px-3.5 py-2.5 border rounded-xl text-base sm:text-sm"
                    />
                    <div className="grid sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Majburiy izoh (masalan: 9-sinf darajasida test tuz) *"
                        value={assignInstruction}
                        onChange={e => setAssignInstruction(e.target.value)}
                        className="sm:col-span-2 px-3.5 py-2.5 border border-slate-300 rounded-xl text-base sm:text-sm"
                      />
                      <select
                        value={assignLanguage}
                        onChange={e => setAssignLanguage(e.target.value)}
                        className="px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-base sm:text-sm"
                      >
                        <option value="O'zbek tili">O‘zbekcha</option>
                        <option value="Ingliz tili">Inglizcha</option>
                        <option value="Rus tili">Ruscha</option>
                        <option value="Qoraqalpoq tili">Qoraqalpoqcha</option>
                      </select>
                    </div>
                    <button
                      disabled={loadingAI}
                      onClick={() => handleGenerateLesson(selectedGroup.id)}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> {loadingAI ? 'AI tayyorlamoqda...' : 'Vazifa yaratish va yuborish'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm sm:text-base">O‘quvchilar ro‘yxati ({groupStats.students.length} ta)</span>
                    <span className="text-[11px] text-slate-400 sm:hidden">← Chapga suring →</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="p-3.5 sm:p-4">O‘quvchi</th>
                          <th className="p-3.5 sm:p-4">Login</th>
                          <th className="p-3.5 sm:p-4">Parol</th>
                          <th className="p-3.5 sm:p-4">Parolni tiklash</th>
                          <th className="p-3.5 sm:p-4">Holati</th>
                          <th className="p-3.5 sm:p-4">Bugungi dars</th>
                          <th className="p-3.5 sm:p-4">O‘rtacha ball</th>
                          <th className="p-3.5 sm:p-4">Anti-Cheat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {groupStats.students.map(st => (
                          <tr key={st.id}>
                            <td className="p-3.5 sm:p-4 font-semibold text-slate-800">{st.full_name}</td>
                            <td className="p-3.5 sm:p-4 font-mono text-slate-600">{st.username}</td>
                            <td className="p-3.5 sm:p-4 font-mono text-slate-400 select-none" title="Parol shifrlangan">
                              ••••••
                            </td>
                            <td className="p-3.5 sm:p-4">
                              <button
                                onClick={() => handleResetStudentPassword(st.id, st.full_name)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                              >
                                <KeyRound className="w-3.5 h-3.5" /> Yangi parol
                              </button>
                            </td>
                            <td className="p-3.5 sm:p-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                                <span className={`w-2.5 h-2.5 rounded-full ${st.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                {st.isOnline ? 'Online' : 'Offline'}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4">{st.minutesToday} daqiqa</td>
                            <td className="p-3.5 sm:p-4 font-semibold text-blue-600">{st.avgScore}%</td>
                            <td className="p-3.5 sm:p-4">
                              {st.cheatWarnings > 0 ? (
                                <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold">
                                  <ShieldAlert className="w-4 h-4" /> {st.cheatWarnings} marta
                                </span>
                              ) : (
                                <span className="text-emerald-600 text-xs">Toza</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-sm sm:text-base">
                      <Trophy className="w-5 h-5 text-amber-500" /> Guruh Reytingi (Leaderboard)
                    </h3>
                    <div className="space-y-2">
                      {groupStats.leaderboard.map((st, idx) => (
                        <div key={st.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                          <span className="font-medium truncate pr-2">#{idx + 1} {st.full_name}</span>
                          <span className="font-bold text-blue-600 shrink-0">{st.xp_points} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-sm sm:text-base">
                      <AlertTriangle className="w-5 h-5 text-red-500" /> Og‘riqli nuqtalar (Heatmap)
                    </h3>
                    {groupStats.heatmap.length === 0 ? (
                      <p className="text-sm text-slate-500">Hozircha xatolar statistikasi yo‘q.</p>
                    ) : (
                      <div className="space-y-2">
                        {groupStats.heatmap.map(h => (
                          <div key={h.questionNumber} className="flex justify-between items-center p-3 bg-red-50 rounded-xl text-sm">
                            <span>{h.questionNumber}-savol</span>
                            <span className="font-bold text-red-600">{h.errorRate}% o‘quvchi adashgan</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <p className="text-slate-600 text-sm">Guruh yaratish yoki tanlash uchun chap menyudan foydalaning.</p>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Guruhlarni ochish
                </button>
              </div>
            )}
          </main>
        </div>

        {showProfileModal && (
          <div
            onClick={() => setShowProfileModal(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 relative"
            >
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-lg font-bold text-slate-800">{user.fullName}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Login: {user.username}</p>
              </div>

              <form onSubmit={handleChangeOwnPassword} className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-600" /> Shaxsiy parolni o‘zgartirish
                </h3>
                <input
                  type="password"
                  placeholder="Eski parolingiz"
                  value={oldPasswordInput}
                  onChange={e => setOldPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Yangi parol"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  disabled={passwordChangeLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition"
                >
                  {passwordChangeLoading ? 'Saqlanmoqda...' : 'Yangi parolni saqlash'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 4. STUDENT PANEL (CHAP MENYU KOMPYUTERDA FIXED)
  // ==========================================
  const studentNavItems = [
    { id: 'new', label: 'Yangi dars', icon: Plus },
    { id: 'library', label: 'Konspektlar', icon: FileText },
    { id: 'tools', label: 'Jihozlar', icon: Calculator },
    { id: 'stats', label: 'AI Tahlil', icon: BarChart3 },
    { id: 'peakmock', label: 'Peakmock', icon: ExternalLink, href: 'https://peakmock.up.railway.app' }
  ];

  const handleStudentNavClick = (id) => {
    setActiveNav(id);
    if (id === 'stats') {
      apiFetch('/ai/weakness-detector', { method: 'POST' }).then(r => setWeaknessReport(r.analysis));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
      {/* Mobil yuqori panel */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <BookOpen className="w-6 h-6" /> EduAI
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleBtn compact />
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 px-2.5 py-2 rounded-xl bg-slate-100">
            <LogOut className="w-3.5 h-3.5" /> Chiqish
          </button>
        </div>
      </header>

      {/* CHAP YON MENYU (Kompyuterda fixed) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 p-5 flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
              <BookOpen className="w-6 h-6" /> EduAI
            </div>
            <ThemeToggleBtn compact />
          </div>
          <nav className="space-y-1.5">
            {studentNavItems.map(item =>
              item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/70 transition"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {item.label}
                  </span>
                  <item.icon className="w-4 h-4" />
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleStudentNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    activeNav === item.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              )
            )}
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm">
          <LogOut className="w-4 h-4" /> Chiqish
        </button>
      </aside>

      {/* ASOSIY KONTENT (lg:pl-64 bilan menyu yonida turadi) */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {announcement && (
          <div className="bg-blue-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
            <Megaphone className="w-4 h-4 shrink-0" /> <span>{announcement.message}</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="relative group focus:outline-none shrink-0"
                title="Profilni ko'rish va rasmni kattalashtirish"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
                    {user?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="block text-[10px] text-center text-blue-600 font-semibold mt-0.5">
                  Profil
                </span>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">Salom, {user.fullName}!</h1>
                <p className="text-xs text-slate-500 truncate">Bugungi o‘qish rejangizni davom ettiring</p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3">
              <div className="bg-white border border-slate-200 px-2.5 sm:px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-orange-600">
                <Flame className="w-4 h-4 shrink-0" /> <span>{user.streak} kun</span>
              </div>
              <div className="bg-white border border-slate-200 px-2.5 sm:px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-600">
                <Trophy className="w-4 h-4 shrink-0" /> <span>{user.xp} XP</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 px-2.5 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-700">
                <Clock className="w-4 h-4 shrink-0" /> <span>{minutesToday} daq</span>
              </div>
            </div>
          </div>

          {activeNav === 'tools' && <StudyTools />}

          {activeNav === 'new' && (
            <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
              {!currentLesson ? (
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                  <label className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-blue-50/30 transition">
                    <Upload className="w-9 h-9 sm:w-10 sm:h-10 text-blue-600 mb-2" />
                    <span className="font-semibold text-slate-700 text-sm sm:text-base">
                      {selectedFile ? selectedFile.name : 'PDF yoki daftar rasmini yuklang'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (20 MB gacha)</span>
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Yoki dars matnini shu yerga joylashtiring (ixtiyoriy, agar fayl yuklangan bo‘lsa)..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="w-full p-3.5 sm:p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                  />

                  <div className="grid sm:grid-cols-3 gap-3 pt-1">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        AI uchun izoh / ko‘rsatma <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: Asosiy formulalarni ajratib, qiyinroq test tuz..."
                        value={lessonInstruction}
                        onChange={e => setLessonInstruction(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Natija tili <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={lessonLanguage}
                        onChange={e => setLessonLanguage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 text-base sm:text-sm font-medium"
                      >
                        <option value="O'zbek tili">O‘zbekcha</option>
                        <option value="Ingliz tili">Inglizcha (English)</option>
                        <option value="Rus tili">Ruscha (Русский)</option>
                        <option value="Qoraqalpoq tili">Qoraqalpoqcha</option>
                      </select>
                    </div>
                  </div>

                  <button
                    disabled={loadingAI}
                    onClick={() => handleGenerateLesson(null)}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Sparkles className="w-5 h-5 shrink-0" />
                    {loadingAI ? 'Gemini AI tayyorlamoqda...' : 'AI bilan Dars Yaratish'}
                  </button>
                </div>
              ) : (
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{currentLesson.title}</h2>
                    <button onClick={() => setCurrentLesson(null)} className="text-sm text-blue-600 font-semibold hover:underline self-start sm:self-auto">
                      + Yangi material yuklash
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2 bg-white p-1.5 rounded-xl border border-slate-200">
                    {[
                      { id: 'summary', label: 'Qisqa konspekt' },
                      { id: 'flashcards', label: 'Flashcards' },
                      { id: 'quiz', label: 'Interaktiv Test' },
                      { id: 'podcast', label: 'Audio Podkast' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex-1 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                          activeTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'summary' && (
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-3">
                      {currentLesson.summary.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-slate-700 text-sm leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'flashcards' && (
                    <div className="space-y-4">
                      <div
                        onClick={() => setFlipped(!flipped)}
                        className="bg-white border-2 border-blue-100 rounded-2xl p-6 sm:p-12 min-h-[210px] sm:min-h-[240px] flex flex-col items-center justify-center text-center cursor-pointer shadow-sm"
                      >
                        <span className="text-xs uppercase tracking-wider text-blue-600 font-bold mb-3">
                          {flipped ? 'Javob' : `Savol (${cardIndex + 1} / ${currentLesson.flashcards.length})`}
                        </span>
                        <p className="text-lg sm:text-xl font-semibold text-slate-800">
                          {flipped ? currentLesson.flashcards[cardIndex]?.a : currentLesson.flashcards[cardIndex]?.q}
                        </p>
                        <span className="text-[11px] text-slate-400 mt-4">(Aylantirish uchun bosing)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <button onClick={() => handleRateFlashcard(1)} className="py-3 px-2 bg-red-50 text-red-600 font-semibold rounded-xl text-xs sm:text-sm">
                          Qiyin
                        </button>
                        <button onClick={() => handleRateFlashcard(2)} className="py-3 px-2 bg-amber-50 text-amber-600 font-semibold rounded-xl text-xs sm:text-sm">
                          O‘rtacha
                        </button>
                        <button onClick={() => handleRateFlashcard(3)} className="py-3 px-2 bg-emerald-50 text-emerald-600 font-semibold rounded-xl text-xs sm:text-sm">
                          Oson
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'quiz' && (
                    <div className="space-y-5 sm:space-y-6">
                      {tabSwitches > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
                          Ogohlantirish: Test vaqtida boshqa oynaga {tabSwitches} marta o‘tdingiz (Anti-Cheat qayd etildi).
                        </div>
                      )}

                      {currentLesson.quiz.map((q, qIdx) => {
                        const chosen = answers[qIdx];
                        const isAnswered = chosen !== undefined;
                        const isWrong = isAnswered && chosen !== q.correctIndex;

                        return (
                          <div key={qIdx} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                            <p className="font-semibold text-slate-800 text-sm sm:text-base">{qIdx + 1}. {q.question}</p>
                            <div className="space-y-2">
                              {q.options.map((opt, oIdx) => {
                                let style = 'border-slate-200 hover:bg-slate-50';
                                if (isAnswered) {
                                  if (oIdx === q.correctIndex) style = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                                  else if (oIdx === chosen) style = 'border-red-500 bg-red-50 text-red-800';
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    disabled={isAnswered}
                                    onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                    className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium flex justify-between items-center gap-2 ${style}`}
                                  >
                                    <span>{opt}</span>
                                    {isAnswered && oIdx === q.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                                    {isAnswered && oIdx === chosen && oIdx !== q.correctIndex && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            {isWrong && (
                              <div className="pt-1">
                                {!tutorExplanations[qIdx] ? (
                                  <button
                                    disabled={loadingTutor === qIdx}
                                    onClick={() => askAiTutor(qIdx, q, chosen)}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                    {loadingTutor === qIdx ? 'AI Repetitor tushuntirmoqda...' : 'AI Repetitordan so‘rash'}
                                  </button>
                                ) : (
                                  <div className="p-3.5 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed">
                                    <span className="font-bold text-blue-700 block mb-1">AI Repetitor izohi:</span>
                                    {tutorExplanations[qIdx]}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {!quizSubmitted ? (
                        <button onClick={submitQuiz} className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl text-sm sm:text-base">
                          Testni yakunlash va ballni saqlash
                        </button>
                      ) : (
                        <div className="p-5 sm:p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                          <p className="text-base sm:text-lg font-bold text-emerald-800">
                            Natija: {Object.entries(answers).filter(([i, a]) => a === currentLesson.quiz[i].correctIndex).length} / {currentLesson.quiz.length} (
                            {Math.round(
                              (Object.entries(answers).filter(([i, a]) => a === currentLesson.quiz[i].correctIndex).length /
                                currentLesson.quiz.length) *
                                100
                            )}
                            %)
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'podcast' && (
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex flex-wrap gap-2.5 sm:gap-3">
                        <button onClick={playPodcast} className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                          <Volume2 className="w-4 h-4" /> Tinglash
                        </button>
                        <button onClick={() => window.speechSynthesis.cancel()} className="flex-1 sm:flex-none bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                          <Square className="w-4 h-4" /> To‘xtatish
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(currentLesson.podcast_script || []).map((line, idx) => (
                          <p key={idx} className="text-sm p-3 bg-slate-50 rounded-xl leading-relaxed">
                            <span className="font-bold text-blue-600">{line.speaker}: </span>
                            {line.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeNav === 'library' && (
            <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-4">
              {lessons.length === 0 ? (
                <p className="text-sm text-slate-500">Hozircha konspektlar mavjud emas.</p>
              ) : (
                lessons.map(l => (
                  <div
                    key={l.id}
                    onClick={() => { openLesson(l); setActiveNav('new'); }}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-500 cursor-pointer transition"
                  >
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${l.group_id ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                      {l.group_id ? 'O‘qituvchi vazifasi' : 'Shaxsiy konspekt'}
                    </span>
                    <h3 className="font-bold text-slate-800 mt-3 text-sm sm:text-base">{l.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{new Date(l.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeNav === 'stats' && (
            <div className="max-w-3xl bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" /> AI Xatolar Tahlilchisi (Weakness Detector)
              </h2>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {weaknessReport || 'Tahlil yuklanmoqda...'}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobil pastki navigatsiya */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around items-center py-2 px-1 z-30">
        {studentNavItems.map(item =>
          item.href ? (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 transition"
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </a>
          ) : (
            <button
              key={item.id}
              onClick={() => handleStudentNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-semibold transition ${
                activeNav === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
              }`}
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          )
        )}
      </nav>

      {/* Profil modali */}
      {showProfileModal && (
        <div
          onClick={() => setShowProfileModal(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 relative my-auto"
          >
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center pt-2">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Kattalashtirilgan profil rasmi"
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover border-4 border-blue-100 shadow-md"
                />
              ) : (
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-blue-600 text-white flex items-center justify-center font-bold text-5xl shadow-md">
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold cursor-pointer transition">
                <Camera className="w-4 h-4" />
                {isUploadingAvatar ? 'Rasm yuklanmoqda...' : 'Rasmni yangilash'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
              </label>

              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-4">{user.fullName}</h2>

              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-xl text-xs">
                <span className="text-slate-500">Login:</span>
                <span className="font-mono font-bold text-blue-700">{user.username}</span>
                <button
                  onClick={() => copyText(user.username, 'student_login')}
                  className="text-slate-500 hover:text-blue-600"
                  title="Loginni nusxalash"
                >
                  {copiedId === 'student_login' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <form onSubmit={handleChangeOwnPassword} className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" /> Parolni o‘zgartirish
              </h3>
              <input
                type="password"
                placeholder="Hozirgi parolingiz"
                value={oldPasswordInput}
                onChange={e => setOldPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Yangi parol"
                value={newPasswordInput}
                onChange={e => setNewPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <button
                disabled={passwordChangeLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition"
              >
                {passwordChangeLoading ? 'Saqlanmoqda...' : 'Yangi parolni saqlash'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <EduAIApp />
    </GoogleOAuthProvider>
  );
}
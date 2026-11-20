import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2, Users, DoorOpen, Plus, Trash2, CheckCircle2, XCircle,
  ArrowRightLeft, UserCheck, Clock, AlertTriangle, LogOut,
  CreditCard, BellRing, ChevronRight, Home, Moon, Sun, BookOpen, Wrench
} from 'lucide-react';
import StudyTools from './StudyTools.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('eduai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eduai_token') || '');
  const [darkMode, setDarkMode] = useState(true);

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [publicGroups, setPublicGroups] = useState([]);
  const [authForm, setAuthForm] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'student',
    subject: '',
    groupId: '',
    parentTelegramChatId: ''
  });

  // Tizim ma'lumotlari
  const [data, setData] = useState({
    branches: [], groups: [], teachers: [], students: [], attendance: []
  });

  // "Mahalla -> Uy -> Xona" navigatsiya holatlari
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [ownerTab, setOwnerTab] = useState('mahalla'); // 'mahalla' | 'teachers'

  // Student va Teacher tablar (Asosiy + O'quv jihozlari)
  const [activeTab, setActiveTab] = useState('main');

  // Formalar
  const [newBranch, setNewBranch] = useState({ name: '', address: '' });
  const [newGroup, setNewGroup] = useState({
    name: '', price: '', lessonDays: 'Dush, Chor, Jum', lessonTime: '14:00 - 16:00', teacherId: ''
  });
  const [enrollForm, setEnrollForm] = useState({
    studentId: '', paymentDueDate: '', parentTelegramChatId: ''
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchPublicGroups = async () => {
    try {
      const res = await axios.get(`${API}/public/groups`);
      setPublicGroups(res.data || []);
    } catch {
      // ignore
    }
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/center/data`, authHeaders);
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (!currentUser) fetchPublicGroups();
    else fetchData();
  }, [currentUser, token]);

  const handleLogout = async () => {
    try {
      if (token) await axios.post(`${API}/auth/logout`, {}, authHeaders);
    } catch {
      // ignore
    }
    localStorage.removeItem('eduai_user');
    localStorage.removeItem('eduai_token');
    setCurrentUser(null);
    setToken('');
    setSelectedBranch(null);
    setSelectedGroup(null);
  };

  // ==========================================
  // 1. YAGONA LOGIN / REGISTER OYNASI
  // ==========================================
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API}${endpoint}`, authForm);
      localStorage.setItem('eduai_token', res.data.token);
      localStorage.setItem('eduai_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      setActiveTab('main');
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              EduAI Platform
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              O'quvchi, O'qituvchi, Markaz Egasi va Admin uchun yagona kirish
            </p>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                authMode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              Kirish (Login)
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                authMode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3.5">
            {authMode === 'register' && (
              <>
                <input
                  type="text"
                  placeholder="Ism Familiya"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm"
                  value={authForm.fullName}
                  onChange={e => setAuthForm({ ...authForm, fullName: e.target.value })}
                />
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm"
                  value={authForm.role}
                  onChange={e => setAuthForm({ ...authForm, role: e.target.value })}
                >
                  <option value="student">O'quvchi (Student)</option>
                  <option value="teacher">O'qituvchi (Teacher)</option>
                  <option value="center_owner">O'quv markaz egasi (Center Owner)</option>
                  <option value="admin">Admin</option>
                </select>

                {authForm.role === 'teacher' && (
                  <input
                    type="text"
                    placeholder="Mutaxassislik fani (masalan: Ingliz tili, Kimyo)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm"
                    value={authForm.subject}
                    onChange={e => setAuthForm({ ...authForm, subject: e.target.value })}
                  />
                )}

                {authForm.role === 'student' && (
                  <>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm"
                      value={authForm.groupId}
                      onChange={e => setAuthForm({ ...authForm, groupId: e.target.value })}
                    >
                      <option value="">Guruhni tanlang (yoki keyinroq yoziling)</option>
                      {publicGroups.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.branchName} — {g.name} ({Number(g.price).toLocaleString()} so'm)
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Ota-ona Telegram Chat ID (bot xabarlari uchun)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm"
                      value={authForm.parentTelegramChatId}
                      onChange={e => setAuthForm({ ...authForm, parentTelegramChatId: e.target.value })}
                    />
                  </>
                )}
              </>
            )}

            <input
              type="text"
              placeholder="Login (username)"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm"
              value={authForm.username}
              onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Parol"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm"
              value={authForm.password}
              onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold transition"
            >
              {authMode === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderPaymentBadge = (status) => {
    if (!status) return null;
    const colors = {
      green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      yellow: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      red: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[status.color] || colors.green}`}>
        {status.label}
      </span>
    );
  };

  // ==========================================
  // 2. O'QUVCHI PANELI (Birinchi bo'lim: Kunlik davomat + To'lov holati narxi bilan)
  // ==========================================
  if (currentUser.role === 'student') {
    const myInfo = data.students.find(s => s.id === currentUser.id);
    const myGroup = data.groups.find(g => g.id === myInfo?.group_id);
    const myAttendance = data.attendance.filter(a => a.student_id === currentUser.id);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0e1621] text-slate-900 dark:text-white p-4 sm:p-6">
        <header className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold">Salom, {currentUser.fullName}!</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">O'quvchi shaxsiy kabineti</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 ${
                activeTab === 'main' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'
              }`}
            >
              <CreditCard size={16} /> Davomat & To'lov
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 ${
                activeTab === 'tools' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'
              }`}
            >
              <Wrench size={16} /> Desmos & Kimyo
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-500/15 text-rose-500 px-4 py-2 rounded-xl text-sm font-medium"
            >
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto space-y-6">
          {activeTab === 'main' ? (
            <>
              {/* ENG BIRINCHI BO'LIM: Kunlik davomat va To'lov holati narxi bilan */}
              <section className="bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-500">
                  <CreditCard size={20} /> Kunlik Davomat va To'lov Holati
                </h2>

                {!myGroup ? (
                  <p className="text-slate-400">Siz hali birorta guruhga biriktirilmagansiz. O'quv markaz ma'muriyatiga murojaat qiling.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-[#242f3d] p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-slate-400">Guruhingiz</span>
                          <h3 className="text-xl font-bold">{myGroup.name}</h3>
                        </div>
                        {renderPaymentBadge(myInfo?.paymentStatus)}
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-sm text-slate-400">Oylik kurs narxi:</span>
                        <span className="text-lg font-extrabold text-emerald-500">
                          {Number(myGroup.price).toLocaleString()} so'm
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Keyingi to'lov sanasi:</span>
                        <span className="font-mono font-bold">{myInfo?.payment_due_date || 'Belgilanmagan'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#242f3d] p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Bugungi dars holati</span>
                        <p className="text-sm text-slate-400 mt-1">
                          Dars kunlari: {myGroup.lesson_days} | {myGroup.lesson_time}
                        </p>
                      </div>

                      <div className="my-4 flex items-center justify-between bg-white dark:bg-[#17212b] p-4 rounded-xl">
                        <span className="font-medium">Bugungi davomat:</span>
                        {myInfo?.todayAttendance === true && (
                          <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                            <CheckCircle2 size={22} /> Keldi
                          </span>
                        )}
                        {myInfo?.todayAttendance === false && (
                          <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                            <XCircle size={22} /> Kelmadi
                          </span>
                        )}
                        {myInfo?.todayAttendance === null && (
                          <span className="text-slate-400 text-sm">Hali belgilanmagan</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Davomat tarixi */}
              <section className="bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold mb-4">Kundalik davomat tarixi</h3>
                {myAttendance.length === 0 ? (
                  <p className="text-sm text-slate-400">Hozircha davomat yozuvlari yo'q.</p>
                ) : (
                  <div className="space-y-2">
                    {myAttendance.map(att => (
                      <div key={att.id} className="flex justify-between items-center bg-slate-50 dark:bg-[#242f3d] px-4 py-3 rounded-xl text-sm">
                        <span className="font-mono">{att.attendance_date}</span>
                        {att.status ? (
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={16} /> Keldi
                          </span>
                        ) : (
                          <span className="text-rose-500 font-semibold flex items-center gap-1">
                            <XCircle size={16} /> Kelmadi
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <StudyTools />
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // 3. O'QITUVCHI PANELI (Guruh ochish va AI uyga vazifa yuborish OLIB TASHLANGAN!)
  // ==========================================
  if (currentUser.role === 'teacher') {
    const myGroups = data.groups.filter(
      g => g.teacher_id === currentUser.id || g.substitute_teacher_id === currentUser.id
    );

    const markAttendance = async (groupId, studentId, status) => {
      await axios.post(`${API}/attendance`, { groupId, studentId, status }, authHeaders);
      fetchData();
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0e1621] text-slate-900 dark:text-white p-4 sm:p-6">
        <header className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold">O'qituvchi Paneli: {currentUser.fullName}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Kunlik davomat va o'quvchilar to'lov holati</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 ${
                activeTab === 'main' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'
              }`}
            >
              <BookOpen size={16} /> Guruhlar & Davomat
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 ${
                activeTab === 'tools' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'
              }`}
            >
              <Wrench size={16} /> O'quv Jihozlari
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-500/15 text-rose-500 px-4 py-2 rounded-xl text-sm font-medium"
            >
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto space-y-6">
          {activeTab === 'tools' ? (
            <StudyTools />
          ) : myGroups.length === 0 ? (
            <div className="bg-white dark:bg-[#17212b] p-8 rounded-2xl text-center text-slate-400">
              Sizga hali guruh biriktirilmagan. O'quv markaz egasi guruh ochib sizni biriktirishi kerak.
            </div>
          ) : (
            myGroups.map(group => {
              const groupStudents = data.students.filter(s => s.group_id === group.id);
              const isSub = group.substitute_teacher_id === currentUser.id && group.teacher_id !== currentUser.id;

              return (
                <div
                  key={group.id}
                  className={`bg-white dark:bg-[#17212b] border rounded-2xl p-6 ${
                    group.isAttendanceMissing ? 'border-rose-500 shadow-lg shadow-rose-500/10' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">{group.name}</h2>
                        {isSub && (
                          <span className="bg-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-full font-medium">
                            Vaqtincha almashtirish
                          </span>
                        )}
                        {group.isAttendanceMissing && (
                          <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                            <AlertTriangle size={14} /> Bugungi davomat olinmagan!
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        Kunlar: {group.lesson_days} | Vaqt: {group.lesson_time} | O'quvchilar: {group.studentCount} ta
                      </p>
                    </div>
                  </div>

                  {/* Davomat (Yashil tick / Qizil X) va To'lov holati */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="pb-3">O'quvchi</th>
                          <th className="pb-3">To'lov holati</th>
                          <th className="pb-3">To'lov sanasi</th>
                          <th className="pb-3 text-right">Davomat (Keldi / Kelmadi)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {groupStudents.map(st => (
                          <tr key={st.id}>
                            <td className="py-4 font-semibold">{st.full_name}</td>
                            <td className="py-4">{renderPaymentBadge(st.paymentStatus)}</td>
                            <td className="py-4 font-mono text-slate-400">{st.payment_due_date || '-'}</td>
                            <td className="py-4 text-right space-x-2">
                              <button
                                onClick={() => markAttendance(group.id, st.id, true)}
                                className={`p-2 rounded-xl border transition ${
                                  st.todayAttendance === true
                                    ? 'bg-emerald-500 text-white border-emerald-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                                }`}
                                title="Keldi (Yashil tick)"
                              >
                                <CheckCircle2 size={20} />
                              </button>
                              <button
                                onClick={() => markAttendance(group.id, st.id, false)}
                                className={`p-2 rounded-xl border transition ${
                                  st.todayAttendance === false
                                    ? 'bg-rose-500 text-white border-rose-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:border-rose-500'
                                }`}
                                title="Kelmadi (Qizil X — Ota-onaga Telegram xabar ketadi)"
                              >
                                <XCircle size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // 4. O'QUV MARKAZ EGASI & ADMIN PANELI ("Mahalla -> Uy -> Xona")
  // ==========================================
  const handleAddBranch = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/branches`, newBranch, authHeaders);
    setNewBranch({ name: '', address: '' });
    fetchData();
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/groups`, { ...newGroup, branchId: selectedBranch.id }, authHeaders);
    setNewGroup({ name: '', price: '', lessonDays: 'Dush, Chor, Jum', lessonTime: '14:00 - 16:00', teacherId: '' });
    fetchData();
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    await axios.put(
      `${API}/students/${enrollForm.studentId}/enroll`,
      {
        groupId: selectedGroup.id,
        paymentDueDate: enrollForm.paymentDueDate,
        parentTelegramChatId: enrollForm.parentTelegramChatId
      },
      authHeaders
    );
    setEnrollForm({ studentId: '', paymentDueDate: '', parentTelegramChatId: '' });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0e1621] text-slate-900 dark:text-white p-4 sm:p-6">
      <header className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold">
            EduAI Boshqaruv Markazi ({currentUser.role === 'center_owner' ? "O'quv Markaz Egasi" : 'Admin'})
          </h1>
          {/* Mahalla -> Uy -> Xona navigatsiya yo'li */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
            <button
              onClick={() => { setOwnerTab('mahalla'); setSelectedBranch(null); setSelectedGroup(null); }}
              className="hover:text-blue-400 flex items-center gap-1"
            >
              <Home size={14} /> Mahalla (Filiallar)
            </button>
            {selectedBranch && (
              <>
                <ChevronRight size={14} />
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="hover:text-blue-400"
                >
                  {selectedBranch.name} (Uy / Guruhlar)
                </button>
              </>
            )}
            {selectedGroup && (
              <>
                <ChevronRight size={14} />
                <span className="text-blue-400 font-semibold">{selectedGroup.name} (Xona)</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setOwnerTab('mahalla'); setSelectedBranch(null); setSelectedGroup(null); }}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium ${
              ownerTab === 'mahalla' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'
            }`}
          >
            Filiallar & Guruhlar
          </button>
          <button
            onClick={() => setOwnerTab('teachers')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium ${
              ownerTab === 'teachers' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'
            }`}
          >
            O'qituvchilar ({data.teachers.length})
          </button>
          <button
            onClick={async () => {
              const res = await axios.post(`${API}/trigger-payment-check`, {}, authHeaders);
              alert(res.data.message);
            }}
            className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3.5 py-2 rounded-xl text-sm"
          >
            <BellRing size={16} /> Qizil to'lovlarga Bot xabar
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-500/15 text-rose-500 px-3.5 py-2 rounded-xl text-sm font-medium"
          >
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* O'QITUVCHILAR RO'YXATI VA QAYSI GURUHLARGA KIRAYOTGANI */}
        {ownerTab === 'teachers' && (
          <div className="bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">O'qituvchilar va ular kirayotgan guruhlar</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.teachers.map(t => (
                <div key={t.id} className="bg-slate-50 dark:bg-[#242f3d] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{t.full_name}</h3>
                        <p className="text-xs text-blue-400">{t.subject || 'O‘qituvchi'} (@{t.username})</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm(`${t.full_name} ni o'chirasizmi?`)) return;
                          await axios.delete(`${API}/users/${t.id}`, authHeaders);
                          fetchData();
                        }}
                        className="text-slate-400 hover:text-rose-500"
                        title="O'qituvchini o'chirish"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-slate-400 mb-2">Kirayotgan guruhlari:</p>
                      {t.assignedGroups?.length === 0 ? (
                        <span className="text-xs text-slate-500">Hali guruh biriktirilmagan</span>
                      ) : (
                        <div className="space-y-1.5">
                          {t.assignedGroups.map(g => (
                            <div key={g.id} className="text-xs bg-white dark:bg-[#17212b] px-3 py-2 rounded-lg flex justify-between">
                              <span className="font-semibold">{g.name}</span>
                              <span className="text-slate-400">{g.studentCount} o'quvchi</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1-BOSQICH: MAHALLA (Filiallar) */}
        {ownerTab === 'mahalla' && !selectedBranch && (
          <div className="space-y-6">
            <form onSubmit={handleAddBranch} className="bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Yangi filial nomi (Mahalla)"
                required
                className="flex-1 bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                value={newBranch.name}
                onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filial manzili"
                required
                className="flex-1 bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                value={newBranch.address}
                onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
              />
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
                <Plus size={16} /> Filial qo'shish
              </button>
            </form>

            <div className="grid md:grid-cols-3 gap-6">
              {data.branches.map(branch => {
                const branchGroups = data.groups.filter(g => g.branch_id === branch.id);
                const missingAttCount = branchGroups.filter(g => g.isAttendanceMissing).length;

                return (
                  <div
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch)}
                    className={`cursor-pointer bg-white dark:bg-[#17212b] border rounded-2xl p-6 hover:border-blue-500 transition ${
                      missingAttCount > 0 ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <Building2 size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        {missingAttCount > 0 && (
                          <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-1 rounded-full font-medium">
                            {missingAttCount} guruhda davomat yo'q!
                          </span>
                        )}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm('Filialni o‘chirasizmi?')) return;
                            await axios.delete(`${API}/branches/${branch.id}`, authHeaders);
                            fetchData();
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">{branch.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{branch.address}</p>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
                      <span>Guruhlar: <b>{branchGroups.length} ta</b></span>
                      <span className="text-blue-500 font-semibold">Mahallaga kirish →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-BOSQICH: UY (Tanlangan filial ichidagi Guruhlar) */}
        {ownerTab === 'mahalla' && selectedBranch && !selectedGroup && (
          <div className="space-y-6">
            {/* Guruh ochish (Faqat Admin / O'quv markaz egasi) */}
            <form onSubmit={handleAddGroup} className="bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl grid md:grid-cols-6 gap-3">
              <input
                type="text"
                placeholder="Guruh nomi"
                required
                className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                value={newGroup.name}
                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="To'lov narxi (so'm)"
                required
                className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                value={newGroup.price}
                onChange={e => setNewGroup({ ...newGroup, price: e.target.value })}
              />
              <input
                type="text"
                placeholder="Kunlar (Dush, Chor, Jum)"
                required
                className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                value={newGroup.lessonDays}
                onChange={e => setNewGroup({ ...newGroup, lessonDays: e.target.value })}
              />
              <input
                type="text"
                placeholder="Vaqti (14:00 - 16:00)"
                required
                className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                value={newGroup.lessonTime}
                onChange={e => setNewGroup({ ...newGroup, lessonTime: e.target.value })}
              />
              <select
                required
                className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                value={newGroup.teacherId}
                onChange={e => setNewGroup({ ...newGroup, teacherId: e.target.value })}
              >
                <option value="">O'qituvchi tanlang</option>
                {data.teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1 py-2">
                <Plus size={16} /> Guruh ochish
              </button>
            </form>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.groups
                .filter(g => g.branch_id === selectedBranch.id)
                .map(group => (
                  <div
                    key={group.id}
                    className={`bg-white dark:bg-[#17212b] border rounded-2xl p-6 flex flex-col justify-between transition ${
                      group.isAttendanceMissing
                        ? 'border-rose-500 bg-rose-500/5 shadow-lg shadow-rose-500/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3
                          onClick={() => setSelectedGroup(group)}
                          className="text-xl font-bold cursor-pointer hover:text-blue-500"
                        >
                          {group.name}
                        </h3>
                        <button
                          onClick={async () => {
                            if (!confirm('Guruhni o‘chirasizmi?')) return;
                            await axios.delete(`${API}/groups/${group.id}`, authHeaders);
                            fetchData();
                          }}
                          className="text-slate-400 hover:text-rose-500"
                          title="Guruhni o'chirish"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <p className="text-emerald-500 font-bold text-lg mt-1">
                        {Number(group.price).toLocaleString()} so'm / oy
                      </p>

                      {group.isAttendanceMissing && (
                        <div className="mt-2 bg-rose-500/20 text-rose-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                          <AlertTriangle size={14} /> O'qituvchi bugun davomat qilmagan!
                        </div>
                      )}

                      <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <p className="flex items-center gap-2">
                          <UserCheck size={16} className="text-blue-500" />
                          Asosiy o'qituvchi: <b>{group.mainTeacherName}</b>
                        </p>
                        <p className="flex items-center gap-2">
                          <Users size={16} className="text-emerald-500" />
                          O'quvchilar soni: <b>{group.studentCount} ta</b>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock size={16} className="text-amber-500" />
                          {group.lesson_days} | {group.lesson_time}
                        </p>
                      </div>

                      {/* O'qituvchini vaqtincha almashtirish (boshqa o'qituvchini ulash) */}
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <label className="text-xs text-slate-400 block mb-1">
                          O'qituvchi kela olmasa boshqasini ulash:
                        </label>
                        <select
                          className="w-full bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                          value={group.substitute_teacher_id || ''}
                          onChange={async (e) => {
                            await axios.put(
                              `${API}/groups/${group.id}/substitute`,
                              { substituteTeacherId: e.target.value },
                              authHeaders
                            );
                            fetchData();
                          }}
                        >
                          <option value="">Asosiy o'qituvchi o'tadi</option>
                          {data.teachers
                            .filter(t => t.id !== group.teacher_id)
                            .map(t => (
                              <option key={t.id} value={t.id}>{t.full_name}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedGroup(group)}
                      className="mt-5 w-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
                    >
                      <DoorOpen size={16} /> Xonaga kirish (O'quvchilar)
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3-BOSQICH: XONA (Guruh ichidagi o'quvchilar, to'lov ticki, svetofor va transfer) */}
        {ownerTab === 'mahalla' && selectedGroup && (
          <div className="space-y-6">
            {/* Guruhga o'quvchi yozish va to'lov sanasini belgilash */}
            <form onSubmit={handleEnrollStudent} className="bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl grid md:grid-cols-4 gap-3">
              <select
                required
                className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                value={enrollForm.studentId}
                onChange={e => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
              >
                <option value="">O'quvchini tanlang...</option>
                {data.students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} (@{s.username})</option>
                ))}
              </select>
              <input
                type="date"
                required
                className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                value={enrollForm.paymentDueDate}
                onChange={e => setEnrollForm({ ...enrollForm, paymentDueDate: e.target.value })}
              />
              <input
                type="text"
                placeholder="Ota-ona Telegram Chat ID"
                className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                value={enrollForm.parentTelegramChatId}
                onChange={e => setEnrollForm({ ...enrollForm, parentTelegramChatId: e.target.value })}
              />
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                + Xonaga (Guruhga) qo'shish
              </button>
            </form>

            {/* Xona jadvali */}
            <div className="bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-x-auto">
              <h2 className="text-lg font-bold mb-4">
                {selectedGroup.name} — O'quvchilar (Narxi: {Number(selectedGroup.price).toLocaleString()} so'm)
              </h2>

              <table className="w-full text-left text-sm">
                <thead className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="pb-3">O'quvchi</th>
                    <th className="pb-3">To'lov sanasi</th>
                    <th className="pb-3">Holati</th>
                    <th className="pb-3">To'lov qildi (Tick)</th>
                    <th className="pb-3">Boshqa guruhga transfer</th>
                    <th className="pb-3 text-right">O'chirish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {data.students
                    .filter(s => s.group_id === selectedGroup.id)
                    .map(st => (
                      <tr key={st.id}>
                        <td className="py-4 font-semibold">
                          <div>{st.full_name}</div>
                          <div className="text-xs text-slate-400">TG ID: {st.parent_telegram_chat_id || 'kiritilmagan'}</div>
                        </td>
                        <td className="py-4">
                          <input
                            type="date"
                            className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono"
                            value={st.payment_due_date || ''}
                            onChange={async (e) => {
                              await axios.put(
                                `${API}/students/${st.id}/payment-date`,
                                { paymentDueDate: e.target.value, isPaid: false },
                                authHeaders
                              );
                              fetchData();
                            }}
                          />
                        </td>
                        <td className="py-4">{renderPaymentBadge(st.paymentStatus)}</td>
                        <td className="py-4">
                          <button
                            onClick={async () => {
                              await axios.put(`${API}/students/${st.id}/pay`, {}, authHeaders);
                              fetchData();
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              st.is_paid
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40 hover:bg-emerald-500 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 size={15} /> {st.is_paid ? "To'lov qilingan ✓" : "To'lov qildi"}
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <ArrowRightLeft size={14} className="text-slate-400" />
                            <select
                              className="bg-slate-50 dark:bg-[#242f3d] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                              value={st.group_id || ''}
                              onChange={async (e) => {
                                await axios.put(
                                  `${API}/students/${st.id}/transfer`,
                                  { newGroupId: e.target.value },
                                  authHeaders
                                );
                                fetchData();
                              }}
                            >
                              {data.groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm(`${st.full_name} ni o'chirasizmi?`)) return;
                              await axios.delete(`${API}/users/${st.id}`, authHeaders);
                              fetchData();
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1.5"
                            title="O'quvchini o'chirish"
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
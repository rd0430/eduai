import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Building2, Users, DoorOpen, Plus, Trash2, CheckCircle2, XCircle,
  ArrowRightLeft, UserCheck, Clock, AlertTriangle, LogOut,
  CreditCard, BellRing, ChevronRight, Home, Moon, Sun, BookOpen,
  Wrench, KeyRound, Copy, Check, ShieldCheck, UserPlus
} from 'lucide-react';
import StudyTools from './StudyTools.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('eduai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eduai_token') || '');

  // Sukut bo'yicha OQ (Kun rejimi)
  const [darkMode, setDarkMode] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const googleBtnRef = useRef(null);

  // Tizim ma'lumotlari
  const [data, setData] = useState({
    branches: [], groups: [], centerOwners: [], teachers: [], students: [], attendance: []
  });

  // "Mahalla -> Uy -> Xona" navigatsiya holatlari
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [ownerTab, setOwnerTab] = useState('mahalla'); // 'mahalla' | 'accounts' | 'owners'

  // Yangi yaratilgan Login-Parolni ko'rsatuvchi karta
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Student va Teacher tablar
  const [activeTab, setActiveTab] = useState('main');

  // Formalar
  const [newOwnerForm, setNewOwnerForm] = useState({ fullName: '', centerName: '' });
  const [newTeacherForm, setNewTeacherForm] = useState({ fullName: '', subject: '' });
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '', groupId: '', paymentDueDate: '', parentTelegramChatId: ''
  });

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

  // Google Gmail Admin tugmasini yuklash
  useEffect(() => {
    if (currentUser) return;
    let cancelled = false;

    async function initGoogleSignIn() {
      try {
        let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        if (!clientId) {
          const cfg = await axios.get(`${API}/auth/google-config`);
          clientId = cfg.data?.googleClientId || '';
        }
        if (!clientId || cancelled) return;

        const renderBtn = () => {
          if (window.google?.accounts?.id && googleBtnRef.current) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                try {
                  const res = await axios.post(`${API}/auth/google-admin`, {
                    credential: response.credential
                  });
                  localStorage.setItem('eduai_token', res.data.token);
                  localStorage.setItem('eduai_user', JSON.stringify(res.data.user));
                  setToken(res.data.token);
                  setCurrentUser(res.data.user);
                  setOwnerTab('owners');
                } catch (err) {
                  alert(err.response?.data?.error || 'Gmail orqali Admin kirishda xato!');
                }
              }
            });
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              width: '320',
              text: 'signin_with'
            });
          } else if (!cancelled) {
            setTimeout(renderBtn, 300);
          }
        };
        renderBtn();
      } catch {
        // ignore
      }
    }

    initGoogleSignIn();
    return () => { cancelled = true; };
  }, [currentUser]);

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
    if (currentUser) fetchData();
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
    setCreatedCredentials(null);
  };

  const copyCredentials = (cred) => {
    const text = `EduAI Kirish ma'lumotlari:\nIsm: ${cred.fullName}\nLogin: ${cred.username}\nParol: ${cred.plainPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // 1. YAGONA LOGIN OYNASI (OQ KUN REJIMI + GMAIL ADMIN)
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/login`, loginForm);
      localStorage.setItem('eduai_token', res.data.token);
      localStorage.setItem('eduai_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      setActiveTab('main');
      setOwnerTab('mahalla');
    } catch (err) {
      alert(err.response?.data?.error || 'Login yoki parol xato');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 font-extrabold text-xl shadow-md">
              E
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">EduAI Platform</h1>
            <p className="text-slate-500 text-sm mt-1">
              O'quv markazi, O'qituvchi va O'quvchilar kirish oynasi
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Login (Username)</label>
              <input
                type="text"
                placeholder="Markaz bergan loginni kiriting"
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Parol</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-sm"
            >
              Kirish
            </button>
          </form>

          {/* Admin uchun Gmail orqali kirish bo'limi */}
          <div className="mt-7 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-400 mb-3 flex items-center justify-center gap-1.5">
              <ShieldCheck size={15} className="text-blue-600" /> Bosh Admin (Gmail orqali kirish)
            </p>
            <div ref={googleBtnRef} className="flex justify-center min-h-[42px]" />
          </div>
        </div>
      </div>
    );
  }

  const renderPaymentBadge = (status) => {
    if (!status) return null;
    const colors = {
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      yellow: 'bg-amber-50 text-amber-700 border-amber-200',
      red: 'bg-rose-50 text-rose-700 border-rose-200'
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
      <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6">
        <header className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 mb-6 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Salom, {currentUser.fullName}!</h1>
            <p className="text-slate-500 text-xs sm:text-sm">O'quvchi shaxsiy kabineti (@{currentUser.username})</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'main' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CreditCard size={16} /> Davomat & To'lov
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'tools' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Wrench size={16} /> Desmos & Kimyo
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              title="Kun/Tun rejimi"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-100"
            >
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto space-y-6">
          {activeTab === 'main' ? (
            <>
              {/* ENG BIRINCHI BO'LIM: Kunlik davomat va To'lov holati narxi bilan */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600">
                  <CreditCard size={20} /> Kunlik Davomat va To'lov Holati
                </h2>

                {!myGroup ? (
                  <p className="text-slate-500">Siz hali birorta guruhga biriktirilmagansiz. O'quv markaz ma'muriyatiga murojaat qiling.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-slate-500">Guruhingiz</span>
                          <h3 className="text-xl font-bold text-slate-900">{myGroup.name}</h3>
                        </div>
                        {renderPaymentBadge(myInfo?.paymentStatus)}
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Oylik kurs narxi:</span>
                        <span className="text-lg font-extrabold text-emerald-600">
                          {Number(myGroup.price).toLocaleString()} so'm
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Keyingi to'lov sanasi:</span>
                        <span className="font-mono font-bold text-slate-900">{myInfo?.payment_due_date || 'Belgilanmagan'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-slate-500">Bugungi dars jadvali</span>
                        <p className="text-sm font-medium text-slate-700 mt-1">
                          Kunlar: {myGroup.lesson_days} | Vaqt: {myGroup.lesson_time}
                        </p>
                      </div>

                      <div className="my-4 flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl">
                        <span className="font-semibold text-slate-700">Bugungi davomat:</span>
                        {myInfo?.todayAttendance === true && (
                          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                            <CheckCircle2 size={22} /> Keldi
                          </span>
                        )}
                        {myInfo?.todayAttendance === false && (
                          <span className="flex items-center gap-1.5 text-rose-600 font-bold">
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
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Kundalik davomat tarixi</h3>
                {myAttendance.length === 0 ? (
                  <p className="text-sm text-slate-500">Hozircha davomat yozuvlari yo'q.</p>
                ) : (
                  <div className="space-y-2">
                    {myAttendance.map(att => (
                      <div key={att.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm">
                        <span className="font-mono font-medium">{att.attendance_date}</span>
                        {att.status ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={16} /> Keldi
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
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
      <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6">
        <header className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 mb-6 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">O'qituvchi Paneli: {currentUser.fullName}</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Kunlik davomat va o'quvchilar to'lov holati</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 ${
                activeTab === 'main' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <BookOpen size={16} /> Guruhlar & Davomat
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 ${
                activeTab === 'tools' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Wrench size={16} /> O'quv Jihozlari
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto space-y-6">
          {activeTab === 'tools' ? (
            <StudyTools />
          ) : myGroups.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500">
              Sizga hali guruh biriktirilmagan. O'quv markaz egasi guruh ochib sizni biriktirishi kerak.
            </div>
          ) : (
            myGroups.map(group => {
              const groupStudents = data.students.filter(s => s.group_id === group.id);
              const isSub = group.substitute_teacher_id === currentUser.id && group.teacher_id !== currentUser.id;

              return (
                <div
                  key={group.id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm ${
                    group.isAttendanceMissing ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">{group.name}</h2>
                        {isSub && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                            Vaqtincha almashtirish
                          </span>
                        )}
                        {group.isAttendanceMissing && (
                          <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                            <AlertTriangle size={14} /> Bugungi davomat olinmagan!
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mt-1">
                        Kunlar: {group.lesson_days} | Vaqt: {group.lesson_time} | O'quvchilar: {group.studentCount} ta
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="pb-3">O'quvchi</th>
                          <th className="pb-3">To'lov holati</th>
                          <th className="pb-3">To'lov sanasi</th>
                          <th className="pb-3 text-right">Davomat (Keldi / Kelmadi)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {groupStudents.map(st => (
                          <tr key={st.id}>
                            <td className="py-4 font-semibold text-slate-900">{st.full_name}</td>
                            <td className="py-4">{renderPaymentBadge(st.paymentStatus)}</td>
                            <td className="py-4 font-mono text-slate-600">{st.payment_due_date || '-'}</td>
                            <td className="py-4 text-right space-x-2">
                              <button
                                onClick={() => markAttendance(group.id, st.id, true)}
                                className={`p-2 rounded-xl border transition ${
                                  st.todayAttendance === true
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-emerald-500'
                                }`}
                                title="Keldi (Yashil tick)"
                              >
                                <CheckCircle2 size={20} />
                              </button>
                              <button
                                onClick={() => markAttendance(group.id, st.id, false)}
                                className={`p-2 rounded-xl border transition ${
                                  st.todayAttendance === false
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-rose-500'
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
  // 4. ADMIN (GMAIL) & O'QUV MARKAZ EGASI PANELI
  // ==========================================
  const handleCreateCenterOwner = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${API}/admin/center-owners`, newOwnerForm, authHeaders);
    setCreatedCredentials({ ...res.data, roleLabel: "O'quv markaz egasi" });
    setNewOwnerForm({ fullName: '', centerName: '' });
    fetchData();
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${API}/owner/teachers`, newTeacherForm, authHeaders);
    setCreatedCredentials({ ...res.data, roleLabel: "O'qituvchi" });
    setNewTeacherForm({ fullName: '', subject: '' });
    fetchData();
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${API}/owner/students`, newStudentForm, authHeaders);
    setCreatedCredentials({ ...res.data, roleLabel: "O'quvchi" });
    setNewStudentForm({ fullName: '', groupId: '', paymentDueDate: '', parentTelegramChatId: '' });
    fetchData();
  };

  const handleResetPassword = async (userId) => {
    const res = await axios.post(`${API}/users/${userId}/reset-password`, {}, authHeaders);
    setCreatedCredentials({ ...res.data, roleLabel: 'Yangi parol' });
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6">
      <header className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 mb-6 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            EduAI Boshqaruv ({currentUser.role === 'admin' ? 'Super Admin — Gmail' : "O'quv Markaz Egasi"})
          </h1>

          {ownerTab === 'mahalla' && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <button
                onClick={() => { setSelectedBranch(null); setSelectedGroup(null); }}
                className="hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                <Home size={14} /> Mahalla (Filiallar)
              </button>
              {selectedBranch && (
                <>
                  <ChevronRight size={14} />
                  <button onClick={() => setSelectedGroup(null)} className="hover:text-blue-600 font-medium">
                    {selectedBranch.name} (Guruhlar)
                  </button>
                </>
              )}
              {selectedGroup && (
                <>
                  <ChevronRight size={14} />
                  <span className="text-blue-600 font-bold">{selectedGroup.name} (Xona)</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setOwnerTab('owners')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold ${
                ownerTab === 'owners' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Markaz Egalari ({data.centerOwners.length})
            </button>
          )}
          <button
            onClick={() => { setOwnerTab('mahalla'); setSelectedBranch(null); setSelectedGroup(null); }}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold ${
              ownerTab === 'mahalla' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Mahalla & Guruhlar
          </button>
          <button
            onClick={() => setOwnerTab('accounts')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 ${
              ownerTab === 'accounts' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <UserPlus size={16} /> O'qituvchi & O'quvchi Loginlari
          </button>
          <button
            onClick={async () => {
              const res = await axios.post(`${API}/trigger-payment-check`, {}, authHeaders);
              alert(res.data.message);
            }}
            className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-2 rounded-xl text-sm font-semibold"
          >
            <BellRing size={16} /> Qizil to'lovlar Bot
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-xl text-sm font-semibold"
          >
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* YANGI YARATILGAN LOGIN VA PAROL KARTASI */}
        {createdCredentials && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {createdCredentials.roleLabel} uchun kirish ma'lumotlari tayyor!
              </span>
              <div className="text-sm sm:text-base text-slate-900">
                Ism: <b>{createdCredentials.fullName}</b> | Login:{' '}
                <code className="bg-white px-2 py-0.5 rounded border font-bold text-blue-700">
                  {createdCredentials.username}
                </code>{' '}
                | Parol:{' '}
                <code className="bg-white px-2 py-0.5 rounded border font-bold text-emerald-700">
                  {createdCredentials.plainPassword}
                </code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCredentials(createdCredentials)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Nusxalandi!' : 'Nusxalash'}
              </button>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="text-slate-500 hover:text-slate-800 px-2 py-1 text-sm"
              >
                Yopish
              </button>
            </div>
          </div>
        )}

        {/* SUPER ADMIN (GMAIL) UCHUN: O'QUV MARKAZ EGALARI YARATISH */}
        {ownerTab === 'owners' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateCenterOwner} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-wrap gap-3 shadow-sm">
              <input
                type="text"
                placeholder="O'quv markaz egasining Ism Familiyasi"
                required
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                value={newOwnerForm.fullName}
                onChange={e => setNewOwnerForm({ ...newOwnerForm, fullName: e.target.value })}
              />
              <input
                type="text"
                placeholder="O'quv markaz nomi"
                required
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                value={newOwnerForm.centerName}
                onChange={e => setNewOwnerForm({ ...newOwnerForm, centerName: e.target.value })}
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Plus size={16} /> Center Owner Login-Parol yaratish
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Ro'yxatdagi O'quv Markaz Egalari</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {data.centerOwners.map(o => (
                  <div key={o.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{o.full_name}</h3>
                      <p className="text-xs text-blue-600 font-medium">{o.subject}</p>
                      <p className="text-xs font-mono text-slate-500 mt-1">Login: {o.username}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleResetPassword(o.id)}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50"
                        title="Yangi parol berish"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`${o.full_name} ni o'chirasizmi?`)) return;
                          await axios.delete(`${API}/users/${o.id}`, authHeaders);
                          fetchData();
                        }}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CENTER OWNER: O'QITUVCHI VA O'QUVCHILARGA LOGIN-PAROL BERISH */}
        {ownerTab === 'accounts' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 1. O'qituvchi yaratish va ro'yxati */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">1. O'qituvchiga Login va Parol berish</h2>
              <form onSubmit={handleCreateTeacher} className="space-y-3">
                <input
                  type="text"
                  placeholder="O'qituvchi Ism Familiyasi"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                  value={newTeacherForm.fullName}
                  onChange={e => setNewTeacherForm({ ...newTeacherForm, fullName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Fani (masalan: Matematika, Ingliz tili)"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                  value={newTeacherForm.subject}
                  onChange={e => setNewTeacherForm({ ...newTeacherForm, subject: e.target.value })}
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold">
                  + O'qituvchi Login-Parolini yaratish
                </button>
              </form>

              <div className="space-y-2.5 pt-2 border-t border-slate-200">
                {data.teachers.map(t => (
                  <div key={t.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900">{t.full_name}</div>
                      <div className="text-xs text-slate-500">
                        {t.subject} | Login: <b className="text-blue-600">{t.username}</b>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Guruhlari:{' '}
                        {t.assignedGroups?.length
                          ? t.assignedGroups.map(g => `${g.name} (${g.studentCount} ta)`).join(', ')
                          : 'Biriktirilmagan'}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleResetPassword(t.id)}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50"
                        title="Parolni yangilash"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`${t.full_name} ni o'chirasizmi?`)) return;
                          await axios.delete(`${API}/users/${t.id}`, authHeaders);
                          fetchData();
                        }}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. O'quvchi yaratish va ro'yxati */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">2. O'quvchiga Login va Parol berish</h2>
              <form onSubmit={handleCreateStudent} className="space-y-3">
                <input
                  type="text"
                  placeholder="O'quvchi Ism Familiyasi"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                  value={newStudentForm.fullName}
                  onChange={e => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={newStudentForm.groupId}
                    onChange={e => setNewStudentForm({ ...newStudentForm, groupId: e.target.value })}
                  >
                    <option value="">Guruhni tanlang (ixtiyoriy)</option>
                    {data.groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    value={newStudentForm.paymentDueDate}
                    onChange={e => setNewStudentForm({ ...newStudentForm, paymentDueDate: e.target.value })}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Ota-ona Telegram Chat ID (bot xabarlari uchun)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                  value={newStudentForm.parentTelegramChatId}
                  onChange={e => setNewStudentForm({ ...newStudentForm, parentTelegramChatId: e.target.value })}
                />
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold">
                  + O'quvchi Login-Parolini yaratish
                </button>
              </form>

              <div className="space-y-2.5 pt-2 border-t border-slate-200 max-h-[420px] overflow-y-auto">
                {data.students.map(st => (
                  <div key={st.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{st.full_name}</div>
                      <div className="text-xs text-slate-500">
                        Guruh: <b>{st.groupName}</b> | Login: <b className="text-emerald-600">{st.username}</b>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {renderPaymentBadge(st.paymentStatus)}
                      <button
                        onClick={() => handleResetPassword(st.id)}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50"
                        title="Parolni yangilash"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`${st.full_name} ni o'chirasizmi?`)) return;
                          await axios.delete(`${API}/users/${st.id}`, authHeaders);
                          fetchData();
                        }}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 1-BOSQICH: MAHALLA (Filiallar) */}
        {ownerTab === 'mahalla' && !selectedBranch && (
          <div className="space-y-6">
            <form onSubmit={handleAddBranch} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap gap-3 shadow-sm">
              <input
                type="text"
                placeholder="Yangi filial nomi (Mahalla)"
                required
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                value={newBranch.name}
                onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filial manzili"
                required
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                value={newBranch.address}
                onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
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
                    className={`cursor-pointer bg-white border rounded-2xl p-6 hover:border-blue-500 transition shadow-sm ${
                      missingAttCount > 0 ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Building2 size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        {missingAttCount > 0 && (
                          <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full font-semibold">
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
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{branch.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{branch.address}</p>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-sm">
                      <span>Guruhlar: <b>{branchGroups.length} ta</b></span>
                      <span className="text-blue-600 font-semibold">Mahallaga kirish →</span>
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
            <form onSubmit={handleAddGroup} className="bg-white border border-slate-200 p-5 rounded-2xl grid md:grid-cols-6 gap-3 shadow-sm">
              <input
                type="text"
                placeholder="Guruh nomi"
                required
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                value={newGroup.name}
                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="To'lov narxi (so'm)"
                required
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                value={newGroup.price}
                onChange={e => setNewGroup({ ...newGroup, price: e.target.value })}
              />
              <input
                type="text"
                placeholder="Kunlar (Dush, Chor, Jum)"
                required
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                value={newGroup.lessonDays}
                onChange={e => setNewGroup({ ...newGroup, lessonDays: e.target.value })}
              />
              <input
                type="text"
                placeholder="Vaqti (14:00 - 16:00)"
                required
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                value={newGroup.lessonTime}
                onChange={e => setNewGroup({ ...newGroup, lessonTime: e.target.value })}
              />
              <select
                required
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                value={newGroup.teacherId}
                onChange={e => setNewGroup({ ...newGroup, teacherId: e.target.value })}
              >
                <option value="">O'qituvchi tanlang</option>
                {data.teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 py-2">
                <Plus size={16} /> Guruh ochish
              </button>
            </form>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.groups
                .filter(g => g.branch_id === selectedBranch.id)
                .map(group => (
                  <div
                    key={group.id}
                    className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition shadow-sm ${
                      group.isAttendanceMissing ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3
                          onClick={() => setSelectedGroup(group)}
                          className="text-xl font-bold text-slate-900 cursor-pointer hover:text-blue-600"
                        >
                          {group.name}
                        </h3>
                        <button
                          onClick={async () => {
                            if (!confirm('Guruhni o‘chirasizmi?')) return;
                            await axios.delete(`${API}/groups/${group.id}`, authHeaders);
                            fetchData();
                          }}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <p className="text-emerald-600 font-bold text-lg mt-1">
                        {Number(group.price).toLocaleString()} so'm / oy
                      </p>

                      {group.isAttendanceMissing && (
                        <div className="mt-2 bg-rose-100 text-rose-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                          <AlertTriangle size={14} /> O'qituvchi bugun davomat qilmagan!
                        </div>
                      )}

                      <div className="mt-4 space-y-2 text-sm text-slate-700">
                        <p className="flex items-center gap-2">
                          <UserCheck size={16} className="text-blue-600" />
                          Asosiy o'qituvchi: <b>{group.mainTeacherName}</b>
                        </p>
                        <p className="flex items-center gap-2">
                          <Users size={16} className="text-emerald-600" />
                          O'quvchilar soni: <b>{group.studentCount} ta</b>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock size={16} className="text-amber-600" />
                          {group.lesson_days} | {group.lesson_time}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <label className="text-xs text-slate-500 block mb-1">
                          O'qituvchi kela olmasa boshqasini ulash:
                        </label>
                        <select
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
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
                      className="mt-5 w-full bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <DoorOpen size={16} /> Xonaga kirish (O'quvchilar)
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3-BOSQICH: XONA */}
        {ownerTab === 'mahalla' && selectedGroup && (
          <div className="space-y-6">
            <form onSubmit={handleEnrollStudent} className="bg-white border border-slate-200 p-4 rounded-2xl grid md:grid-cols-4 gap-3 shadow-sm">
              <select
                required
                className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
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
                className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                value={enrollForm.paymentDueDate}
                onChange={e => setEnrollForm({ ...enrollForm, paymentDueDate: e.target.value })}
              />
              <input
                type="text"
                placeholder="Ota-ona Telegram Chat ID"
                className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                value={enrollForm.parentTelegramChatId}
                onChange={e => setEnrollForm({ ...enrollForm, parentTelegramChatId: e.target.value })}
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                + Xonaga (Guruhga) qo'shish
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 overflow-x-auto shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {selectedGroup.name} — O'quvchilar (Narxi: {Number(selectedGroup.price).toLocaleString()} so'm)
              </h2>

              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="pb-3">O'quvchi</th>
                    <th className="pb-3">To'lov sanasi</th>
                    <th className="pb-3">Holati</th>
                    <th className="pb-3">To'lov qildi (Tick)</th>
                    <th className="pb-3">Boshqa guruhga transfer</th>
                    <th className="pb-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.students
                    .filter(s => s.group_id === selectedGroup.id)
                    .map(st => (
                      <tr key={st.id}>
                        <td className="py-4 font-semibold text-slate-900">
                          <div>{st.full_name}</div>
                          <div className="text-xs text-slate-500">Login: @{st.username} | TG: {st.parent_telegram_chat_id || '-'}</div>
                        </td>
                        <td className="py-4">
                          <input
                            type="date"
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
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
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 size={15} /> {st.is_paid ? "To'lov qilingan ✓" : "To'lov qildi"}
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <ArrowRightLeft size={14} className="text-slate-400" />
                            <select
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs"
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
                        <td className="py-4 text-right space-x-1">
                          <button
                            onClick={() => handleResetPassword(st.id)}
                            className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg"
                            title="Yangi parol berish"
                          >
                            <KeyRound size={16} />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`${st.full_name} ni o'chirasizmi?`)) return;
                              await axios.delete(`${API}/users/${st.id}`, authHeaders);
                              fetchData();
                            }}
                            className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg"
                            title="O'quvchini o'chirish"
                          >
                            <Trash2 size={16} />
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
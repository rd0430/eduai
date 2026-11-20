import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Building2, Users, Plus, Trash2, CheckCircle2, XCircle,
  ArrowRightLeft, UserCheck, Clock, AlertTriangle, LogOut,
  CreditCard, BellRing, ChevronRight, Moon, Sun, BookOpen,
  Wrench, KeyRound, Copy, Check, ShieldCheck, UserPlus,
  LayoutGrid, Menu, X, Wallet, TrendingUp, AlertCircle
} from 'lucide-react';
import StudyTools from './StudyTools.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('eduai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eduai_token') || '');

  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const googleBtnRef = useRef(null);

  const [data, setData] = useState({
    branches: [],
    groups: [],
    centerOwners: [],
    teachers: [],
    students: [],
    attendance: [],
    payments: [],
    financeSummary: { monthlyIncome: 0, totalIncome: 0, overdueDebt: 0, upcomingExpected: 0 }
  });

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [ownerTab, setOwnerTab] = useState('branches'); // 'branches' | 'accounts' | 'finance' | 'owners'

  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('main');

  const [newOwnerForm, setNewOwnerForm] = useState({ fullName: '', centerName: '' });
  const [newTeacherForm, setNewTeacherForm] = useState({ fullName: '', subject: '' });
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '', groupId: '', paymentDueDate: '', parentTelegramChatId: ''
  });
  const [newPaymentForm, setNewPaymentForm] = useState({
    studentId: '', amount: '', paymentMethod: 'Naqd', note: ''
  });

  const [newBranch, setNewBranch] = useState({ name: '', address: '' });
  const [newGroup, setNewGroup] = useState({
    name: '', price: '', lessonDays: 'Dush, Chor, Jum', lessonTime: '14:00 - 16:00', teacherId: ''
  });
  const [enrollForm, setEnrollForm] = useState({
    studentId: '', paymentDueDate: '', parentTelegramChatId: ''
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

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
              width: '280',
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
  // 1. LOGIN OYNASI
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
      setOwnerTab('branches');
    } catch (err) {
      alert(err.response?.data?.error || 'Login yoki parol xato');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 font-extrabold text-xl shadow-md">
              E
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">EduAI Platform</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
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

          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-500 mb-3 flex items-center justify-center gap-1.5">
              <ShieldCheck size={15} className="text-blue-600" /> Bosh Admin (Gmail orqali kirish)
            </p>
            <div ref={googleBtnRef} className="flex justify-center min-h-[42px] overflow-hidden" />
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
      <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[status.color] || colors.green}`}>
        {status.label}
      </span>
    );
  };

  // ==========================================
  // CHAP TOMONDA FIXED SIDEBAR + RESPONSIVE MOBILE DRAWER
  // ==========================================
  const renderSidebarLayout = (navItems, roleSubtitle, children) => (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 shadow-lg lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0">
                E
              </div>
              <div>
                <div className="font-extrabold text-slate-900 leading-tight">EduAI</div>
                <div className="text-[11px] text-slate-500 font-medium">{roleSubtitle}</div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <div className="font-bold text-sm text-slate-900 truncate">{currentUser.fullName}</div>
            <div className="text-xs text-slate-500 truncate">@{currentUser.username}</div>
          </div>

          <nav className="p-3 space-y-1.5">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
                    item.active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : item.variant === 'warning'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-200 space-y-1.5 bg-white">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Kun rejimi (Oq)' : 'Tun rejimi'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
          >
            <LogOut size={18} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700"
            aria-label="Menyu"
          >
            <Menu size={20} />
          </button>
          <div className="text-center">
            <span className="font-extrabold text-slate-900 block leading-none">EduAI</span>
            <span className="text-[10px] text-slate-500">{roleSubtitle}</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="p-3.5 sm:p-6 max-w-6xl w-full mx-auto space-y-5">
          {children}
        </main>
      </div>
    </div>
  );

  // ==========================================
  // 2. O'QUVCHI PANELI
  // ==========================================
  if (currentUser.role === 'student') {
    const myInfo = data.students.find(s => s.id === currentUser.id);
    const myGroup = data.groups.find(g => g.id === myInfo?.group_id);
    const myAttendance = data.attendance.filter(a => a.student_id === currentUser.id);

    const studentNav = [
      {
        label: "Davomat & To'lov",
        icon: CreditCard,
        active: activeTab === 'main',
        onClick: () => setActiveTab('main')
      },
      {
        label: 'Desmos & Kimyo',
        icon: Wrench,
        active: activeTab === 'tools',
        onClick: () => setActiveTab('tools')
      }
    ];

    return renderSidebarLayout(studentNav, "O'quvchi paneli", (
      <>
        {activeTab === 'main' ? (
          <>
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-blue-600">
                <CreditCard size={20} /> Kunlik Davomat va To'lov Holati
              </h2>

              {!myGroup ? (
                <p className="text-sm text-slate-500">Siz hali birorta guruhga biriktirilmagansiz. O'quv markaz ma'muriyatiga murojaat qiling.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <span className="text-xs text-slate-500">Guruhingiz</span>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{myGroup.name}</h3>
                      </div>
                      {renderPaymentBadge(myInfo?.paymentStatus)}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                      <span className="text-slate-600">Oylik kurs narxi:</span>
                      <span className="text-base sm:text-lg font-extrabold text-emerald-600">
                        {Number(myGroup.price).toLocaleString()} so'm
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Keyingi to'lov sanasi:</span>
                      <span className="font-mono font-bold text-slate-900">{myInfo?.payment_due_date || 'Belgilanmagan'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-500">Dars jadvali</span>
                      <p className="text-sm font-medium text-slate-700 mt-1">
                        Kunlar: {myGroup.lesson_days} | Vaqt: {myGroup.lesson_time}
                      </p>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl">
                      <span className="font-semibold text-sm text-slate-700">Bugungi davomat:</span>
                      {myInfo?.todayAttendance === true && (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                          <CheckCircle2 size={20} /> Keldi
                        </span>
                      )}
                      {myInfo?.todayAttendance === false && (
                        <span className="flex items-center gap-1.5 text-rose-600 font-bold text-sm">
                          <XCircle size={20} /> Kelmadi
                        </span>
                      )}
                      {myInfo?.todayAttendance === null && (
                        <span className="text-slate-400 text-xs sm:text-sm">Hali belgilanmagan</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 text-base">Kundalik davomat tarixi</h3>
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
      </>
    ));
  }

  // ==========================================
  // 3. O'QITUVCHI PANELI
  // ==========================================
  if (currentUser.role === 'teacher') {
    const myGroups = data.groups.filter(
      g => g.teacher_id === currentUser.id || g.substitute_teacher_id === currentUser.id
    );

    const markAttendance = async (groupId, studentId, status) => {
      try {
        await axios.post(`${API}/attendance`, { groupId, studentId, status }, authHeaders);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || 'Davomatni saqlashda xatolik yuz berdi!');
      }
    };

    const teacherNav = [
      {
        label: 'Guruhlar & Davomat',
        icon: BookOpen,
        active: activeTab === 'main',
        onClick: () => setActiveTab('main')
      },
      {
        label: "O'quv Jihozlari",
        icon: Wrench,
        active: activeTab === 'tools',
        onClick: () => setActiveTab('tools')
      }
    ];

    return renderSidebarLayout(teacherNav, "O'qituvchi paneli", (
      <>
        {activeTab === 'tools' ? (
          <StudyTools />
        ) : myGroups.length === 0 ? (
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl text-center text-sm text-slate-500">
            Sizga hali guruh biriktirilmagan. O'quv markaz egasi guruh ochib sizni biriktirishi kerak.
          </div>
        ) : (
          myGroups.map(group => {
            const groupStudents = data.students.filter(s => s.group_id === group.id);
            const isSub = group.substitute_teacher_id === currentUser.id && group.teacher_id !== currentUser.id;

            return (
              <div
                key={group.id}
                className={`bg-white border rounded-2xl p-4 sm:p-6 shadow-sm ${
                  group.isAttendanceMissing ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap justify-between items-center gap-3 mb-5 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">{group.name}</h2>
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
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      Kunlar: {group.lesson_days} | Vaqt: {group.lesson_time} | O'quvchilar: {group.studentCount} ta
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full min-w-[540px] text-left text-sm">
                    <thead className="text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="pb-3">O'quvchi</th>
                        <th className="pb-3">To'lov holati</th>
                        <th className="pb-3">To'lov sanasi</th>
                        <th className="pb-3 text-right">Davomat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {groupStudents.map(st => (
                        <tr key={st.id}>
                          <td className="py-3.5 font-semibold text-slate-900">{st.full_name}</td>
                          <td className="py-3.5">{renderPaymentBadge(st.paymentStatus)}</td>
                          <td className="py-3.5 font-mono text-xs sm:text-sm text-slate-600">{st.payment_due_date || '-'}</td>
                          <td className="py-3.5 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => markAttendance(group.id, st.id, true)}
                              className={`p-2 rounded-xl border transition ${
                                st.todayAttendance === true
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-emerald-500'
                              }`}
                              title="Keldi (Yashil tick)"
                            >
                              <CheckCircle2 size={18} />
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
                              <XCircle size={18} />
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
      </>
    ));
  }

  // ==========================================
  // 4. ADMIN (GMAIL) & O'QUV MARKAZ EGASI PANELI
  // ==========================================
  const handleCreateCenterOwner = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/admin/center-owners`, newOwnerForm, authHeaders);
      setCreatedCredentials({ ...res.data, roleLabel: "O'quv markaz egasi" });
      setNewOwnerForm({ fullName: '', centerName: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Markaz egasi yaratishda xatolik yuz berdi!');
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/owner/teachers`, newTeacherForm, authHeaders);
      setCreatedCredentials({ ...res.data, roleLabel: "O'qituvchi" });
      setNewTeacherForm({ fullName: '', subject: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "O'qituvchi yaratishda xatolik yuz berdi!");
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/owner/students`, newStudentForm, authHeaders);
      setCreatedCredentials({ ...res.data, roleLabel: "O'quvchi" });
      setNewStudentForm({ fullName: '', groupId: '', paymentDueDate: '', parentTelegramChatId: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "O'quvchi yaratishda xatolik yuz berdi!");
    }
  };

  const handleAddManualPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/payments`, newPaymentForm, authHeaders);
      setNewPaymentForm({ studentId: '', amount: '', paymentMethod: 'Naqd', note: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "To'lov qo'shishda xatolik yuz berdi!");
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const res = await axios.post(`${API}/users/${userId}/reset-password`, {}, authHeaders);
      setCreatedCredentials({ ...res.data, roleLabel: 'Yangi parol' });
    } catch (err) {
      alert(err.response?.data?.error || 'Parol yangilashda xatolik!');
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/branches`, newBranch, authHeaders);
      setNewBranch({ name: '', address: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Filial qo'shishda xatolik yuz berdi!");
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.teacherId) {
      alert("Avval 'O'qituvchi & O'quvchilar' bo'limidan o'qituvchi yarating va tanlang!");
      return;
    }
    try {
      await axios.post(`${API}/groups`, { ...newGroup, branchId: selectedBranch.id }, authHeaders);
      setNewGroup({ name: '', price: '', lessonDays: 'Dush, Chor, Jum', lessonTime: '14:00 - 16:00', teacherId: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Guruh ochishda xatolik yuz berdi!');
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
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
    } catch (err) {
      alert(err.response?.data?.error || "O'quvchini guruhga qo'shishda xatolik!");
    }
  };

  const adminNav = [
    ...(currentUser.role === 'admin'
      ? [{
          label: `Markaz Egalari (${data.centerOwners.length})`,
          icon: ShieldCheck,
          active: ownerTab === 'owners',
          onClick: () => { setOwnerTab('owners'); setSelectedBranch(null); setSelectedGroup(null); }
        }]
      : []),
    {
      label: 'Filiallar & Guruhlar',
      icon: Building2,
      active: ownerTab === 'branches',
      onClick: () => { setOwnerTab('branches'); setSelectedBranch(null); setSelectedGroup(null); }
    },
    {
      label: "O'qituvchi & O'quvchilar",
      icon: UserPlus,
      active: ownerTab === 'accounts',
      onClick: () => { setOwnerTab('accounts'); setSelectedBranch(null); setSelectedGroup(null); }
    },
    {
      label: 'Moliya & Kassa',
      icon: Wallet,
      active: ownerTab === 'finance',
      onClick: () => { setOwnerTab('finance'); setSelectedBranch(null); setSelectedGroup(null); }
    },
    {
      label: "Qizil to'lovlar Bot",
      icon: BellRing,
      variant: 'warning',
      active: false,
      onClick: async () => {
        const res = await axios.post(`${API}/trigger-payment-check`, {}, authHeaders);
        alert(res.data.message);
      }
    }
  ];

  const roleTitle = currentUser.role === 'admin' ? 'Super Admin (Gmail)' : "O'quv Markaz Egasi";
  const fin = data.financeSummary || { monthlyIncome: 0, totalIncome: 0, overdueDebt: 0, upcomingExpected: 0 };

  return renderSidebarLayout(adminNav, roleTitle, (
    <>
      {ownerTab === 'branches' && (
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 shadow-sm">
          <button
            onClick={() => { setSelectedBranch(null); setSelectedGroup(null); }}
            className="hover:text-blue-600 flex items-center gap-1.5 font-semibold text-slate-800"
          >
            <LayoutGrid size={15} className="text-blue-600" /> Filiallar
          </button>
          {selectedBranch && (
            <>
              <ChevronRight size={14} />
              <button onClick={() => setSelectedGroup(null)} className="hover:text-blue-600 font-semibold text-slate-800">
                {selectedBranch.name} (Guruhlar)
              </button>
            </>
          )}
          {selectedGroup && (
            <>
              <ChevronRight size={14} />
              <span className="text-blue-600 font-bold">{selectedGroup.name} (O'quvchilar)</span>
            </>
          )}
        </div>
      )}

      {createdCredentials && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              {createdCredentials.roleLabel} uchun kirish ma'lumotlari tayyor!
            </span>
            <div className="text-sm text-slate-900 flex flex-wrap items-center gap-2">
              <span>Ism: <b>{createdCredentials.fullName}</b></span>
              <span>Login: <code className="bg-white px-2 py-0.5 rounded border font-bold text-blue-700">{createdCredentials.username}</code></span>
              <span>Parol: <code className="bg-white px-2 py-0.5 rounded border font-bold text-emerald-700">{createdCredentials.plainPassword}</code></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyCredentials(createdCredentials)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Nusxalandi!' : 'Nusxalash'}
            </button>
            <button
              onClick={() => setCreatedCredentials(null)}
              className="text-slate-500 hover:text-slate-800 px-3 py-2 text-sm"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* MARKAZ ICHKI MOLIYASI (KASSA VA QARZDORLIK) */}
      {ownerTab === 'finance' && (
        <div className="space-y-6">
          {/* 4 ta asosiy moliyaviy ko'rsatkich */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold uppercase">Shu oydagi tushum</span>
                <TrendingUp size={18} />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {fin.monthlyIncome.toLocaleString()} <span className="text-xs font-medium text-slate-500">so'm</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-xs font-bold uppercase">Jami kassa tushumi</span>
                <Wallet size={18} />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {fin.totalIncome.toLocaleString()} <span className="text-xs font-medium text-slate-500">so'm</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-bold uppercase">Qizil qarzdorlik</span>
                <AlertCircle size={18} />
              </div>
              <div className="text-2xl font-extrabold text-rose-600">
                {fin.overdueDebt.toLocaleString()} <span className="text-xs font-medium text-slate-500">so'm</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-bold uppercase">Kutilayotgan tushum</span>
                <Clock size={18} />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {fin.upcomingExpected.toLocaleString()} <span className="text-xs font-medium text-slate-500">so'm</span>
              </div>
            </div>
          </div>

          {/* Kassaga qo'lda kirim qo'shish formasi */}
          <form onSubmit={handleAddManualPayment} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shadow-sm">
            <select
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newPaymentForm.studentId}
              onChange={e => {
                const st = data.students.find(s => s.id === e.target.value);
                setNewPaymentForm({
                  ...newPaymentForm,
                  studentId: e.target.value,
                  amount: st?.coursePrice || ''
                });
              }}
            >
              <option value="">O'quvchini tanlang...</option>
              {data.students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.groupName})</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Summa (so'm)"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newPaymentForm.amount}
              onChange={e => setNewPaymentForm({ ...newPaymentForm, amount: e.target.value })}
            />
            <select
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newPaymentForm.paymentMethod}
              onChange={e => setNewPaymentForm({ ...newPaymentForm, paymentMethod: e.target.value })}
            >
              <option value="Naqd">Naqd pul</option>
              <option value="Karta / P2P">Karta / P2P</option>
              <option value="Click / Payme">Click / Payme</option>
            </select>
            <input
              type="text"
              placeholder="Izoh (ixtiyoriy)"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newPaymentForm.note}
              onChange={e => setNewPaymentForm({ ...newPaymentForm, note: e.target.value })}
            />
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 py-2.5">
              <Plus size={16} /> Kirim qo'shish
            </button>
          </form>

          {/* To'lovlar tarixi jadvali */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Kassa kirimlar tarixi</h2>
            {data.payments.length === 0 ? (
              <p className="text-sm text-slate-500">Hozircha to'lovlar qayd etilmagan.</p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="pb-3">Sana</th>
                      <th className="pb-3">O'quvchi</th>
                      <th className="pb-3">Guruh</th>
                      <th className="pb-3">To'lov turi</th>
                      <th className="pb-3">Summa</th>
                      <th className="pb-3 text-right">O'chirish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.payments.map(p => (
                      <tr key={p.id}>
                        <td className="py-3 font-mono text-xs text-slate-500">
                          {new Date(p.paid_at).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="py-3 font-semibold text-slate-900">{p.studentName}</td>
                        <td className="py-3 text-slate-600">{p.groupName}</td>
                        <td className="py-3">
                          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-emerald-600">
                          +{p.amount.toLocaleString()} so'm
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm("Ushbu to'lov yozuvini o'chirasizmi?")) return;
                              await axios.delete(`${API}/payments/${p.id}`, authHeaders);
                              fetchData();
                            }}
                            className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUPER ADMIN (GMAIL): MARKAZ EGALARI */}
      {ownerTab === 'owners' && currentUser.role === 'admin' && (
        <div className="space-y-5">
          <form onSubmit={handleCreateCenterOwner} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 shadow-sm">
            <input
              type="text"
              placeholder="O'quv markaz egasining Ism Familiyasi"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
              value={newOwnerForm.fullName}
              onChange={e => setNewOwnerForm({ ...newOwnerForm, fullName: e.target.value })}
            />
            <input
              type="text"
              placeholder="O'quv markaz nomi"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
              value={newOwnerForm.centerName}
              onChange={e => setNewOwnerForm({ ...newOwnerForm, centerName: e.target.value })}
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <Plus size={16} /> Center Owner Login-Parol yaratish
            </button>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold mb-4">Ro'yxatdagi O'quv Markaz Egalari</h2>
            {data.centerOwners.length === 0 ? (
              <p className="text-sm text-slate-500">Hozircha o'quv markaz egalari yaratilmagan.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.centerOwners.map(o => (
                  <div key={o.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{o.full_name}</h3>
                      <p className="text-xs text-blue-600 font-medium truncate">{o.subject}</p>
                      <p className="text-xs font-mono text-slate-500 mt-1 truncate">Login: {o.username}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleResetPassword(o.id)}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50"
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
                        className="p-2 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* O'QITUVCHI VA O'QUVCHILAR LOGIN-PAROL YARATISH */}
      {ownerTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">1. O'qituvchiga Login va Parol berish</h2>
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
                <div key={t.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{t.full_name}</div>
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
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleResetPassword(t.id)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50"
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
                      className="p-2 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">2. O'quvchiga Login va Parol berish</h2>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <input
                type="text"
                placeholder="O'quvchi Ism Familiyasi"
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                value={newStudentForm.fullName}
                onChange={e => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
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
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
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
                <div key={st.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-wrap justify-between items-center gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{st.full_name}</div>
                    <div className="text-xs text-slate-500">
                      Guruh: <b>{st.groupName}</b> | Login: <b className="text-emerald-600">{st.username}</b>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {renderPaymentBadge(st.paymentStatus)}
                    <button
                      onClick={() => handleResetPassword(st.id)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50"
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
                      className="p-2 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50"
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

      {/* 1-DARAJA: FILIALLAR */}
      {ownerTab === 'branches' && !selectedBranch && (
        <div className="space-y-5">
          <form onSubmit={handleAddBranch} className="bg-white border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 shadow-sm">
            <input
              type="text"
              placeholder="Yangi filial nomi"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
              value={newBranch.name}
              onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filial manzili"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
              value={newBranch.address}
              onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <Plus size={16} /> Filial qo'shish
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data.branches.map(branch => {
              const branchGroups = data.groups.filter(g => g.branch_id === branch.id);
              const missingAttCount = branchGroups.filter(g => g.isAttendanceMissing).length;

              return (
                <div
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch)}
                  className={`cursor-pointer bg-white border rounded-2xl p-5 sm:p-6 hover:border-blue-500 transition shadow-sm ${
                    missingAttCount > 0 ? 'border-rose-400' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Building2 size={22} />
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
                        className="text-slate-400 hover:text-rose-600 p-1.5"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">{branch.name}</h3>
                  <p className="text-slate-500 text-sm mt-1">{branch.address}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-sm">
                    <span>Guruhlar: <b>{branchGroups.length} ta</b></span>
                    <span className="text-blue-600 font-semibold">Guruhlarni ochish →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-DARAJA: TANLANGAN FILIALDAGI GURUHLAR */}
      {ownerTab === 'branches' && selectedBranch && !selectedGroup && (
        <div className="space-y-5">
          <form onSubmit={handleAddGroup} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 shadow-sm">
            <input
              type="text"
              placeholder="Guruh nomi"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newGroup.name}
              onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="To'lov narxi (so'm)"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newGroup.price}
              onChange={e => setNewGroup({ ...newGroup, price: e.target.value })}
            />
            <input
              type="text"
              placeholder="Kunlar (Dush, Chor, Jum)"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newGroup.lessonDays}
              onChange={e => setNewGroup({ ...newGroup, lessonDays: e.target.value })}
            />
            <input
              type="text"
              placeholder="Vaqti (14:00 - 16:00)"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newGroup.lessonTime}
              onChange={e => setNewGroup({ ...newGroup, lessonTime: e.target.value })}
            />
            <select
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
              value={newGroup.teacherId}
              onChange={e => setNewGroup({ ...newGroup, teacherId: e.target.value })}
            >
              <option value="">O'qituvchi tanlang</option>
              {data.teachers.map(t => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 py-2.5">
              <Plus size={16} /> Guruh ochish
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data.groups
              .filter(g => g.branch_id === selectedBranch.id)
              .map(group => (
                <div
                  key={group.id}
                  className={`bg-white border rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition shadow-sm ${
                    group.isAttendanceMissing ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3
                        onClick={() => setSelectedGroup(group)}
                        className="text-lg sm:text-xl font-bold text-slate-900 cursor-pointer hover:text-blue-600"
                      >
                        {group.name}
                      </h3>
                      <button
                        onClick={async () => {
                          if (!confirm('Guruhni o‘chirasizmi?')) return;
                          await axios.delete(`${API}/groups/${group.id}`, authHeaders);
                          fetchData();
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-emerald-600 font-bold text-base sm:text-lg mt-1">
                      {Number(group.price).toLocaleString()} so'm / oy
                    </p>

                    {group.isAttendanceMissing && (
                      <div className="mt-2 bg-rose-100 text-rose-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                        <AlertTriangle size={14} className="shrink-0" /> O'qituvchi bugun davomat qilmagan!
                      </div>
                    )}

                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <p className="flex items-center gap-2">
                        <UserCheck size={16} className="text-blue-600 shrink-0" />
                        <span>Asosiy o'qituvchi: <b>{group.mainTeacherName}</b></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Users size={16} className="text-emerald-600 shrink-0" />
                        <span>O'quvchilar soni: <b>{group.studentCount} ta</b></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-600 shrink-0" />
                        <span>{group.lesson_days} | {group.lesson_time}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <label className="text-xs text-slate-500 block mb-1">
                        O'qituvchi kela olmasa boshqasini ulash:
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs"
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
                    <Users size={16} /> O'quvchilar ro'yxati
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3-DARAJA: GURUH ICHIDAGI O'QUVCHILAR */}
      {ownerTab === 'branches' && selectedGroup && (
        <div className="space-y-5">
          <form onSubmit={handleEnrollStudent} className="bg-white border border-slate-200 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-sm">
            <select
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
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
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
              value={enrollForm.paymentDueDate}
              onChange={e => setEnrollForm({ ...enrollForm, paymentDueDate: e.target.value })}
            />
            <input
              type="text"
              placeholder="Ota-ona Telegram Chat ID"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
              value={enrollForm.parentTelegramChatId}
              onChange={e => setEnrollForm({ ...enrollForm, parentTelegramChatId: e.target.value })}
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              + Guruhga qo'shish
            </button>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 overflow-x-auto shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              {selectedGroup.name} — O'quvchilar (Narxi: {Number(selectedGroup.price).toLocaleString()} so'm)
            </h2>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[720px] text-left text-sm">
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
                        <td className="py-3.5 font-semibold text-slate-900">
                          <div>{st.full_name}</div>
                          <div className="text-xs text-slate-500">Login: @{st.username} | TG: {st.parent_telegram_chat_id || '-'}</div>
                        </td>
                        <td className="py-3.5">
                          <input
                            type="date"
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono"
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
                        <td className="py-3.5">{renderPaymentBadge(st.paymentStatus)}</td>
                        <td className="py-3.5">
                          <button
                            onClick={async () => {
                              await axios.put(`${API}/students/${st.id}/pay`, {}, authHeaders);
                              fetchData();
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${
                              st.is_paid
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 size={15} /> {st.is_paid ? "To'lov qilingan ✓" : "To'lov qildi"}
                          </button>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <ArrowRightLeft size={14} className="text-slate-400 shrink-0" />
                            <select
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
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
                        <td className="py-3.5 text-right space-x-1 whitespace-nowrap">
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
        </div>
      )}
    </>
  ));
}
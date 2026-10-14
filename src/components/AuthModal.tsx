import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { City, Sport } from '../types/index.ts';
import {
  X,
  LogIn,
  UserPlus,
  KeyRound,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Dumbbell,
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot' | 'personas';
  cities: City[];
  sports: Sport[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  initialTab = 'login',
  cities,
  sports,
}) => {
  const { login, register, allUsers, switchUser, currentUser } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot' | 'personas'>(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCityId, setRegCityId] = useState(cities[0]?.id || 'city-1');
  const [regSportId, setRegSportId] = useState(sports[0]?.id || 'sport-volleyball');
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login(loginEmail);
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Неверный email или пароль');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regFirstName.trim() || !regLastName.trim()) {
      setRegError('Укажите имя и фамилию');
      return;
    }
    if (!regEmail.includes('@')) {
      setRegError('Укажите корректный email');
      return;
    }
    setRegLoading(true);
    try {
      const selectedSport = sports.find((s) => s.id === regSportId);
      const defaultLevelId = selectedSport?.levels[0]?.id;

      await register({
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim() || '+7 (900) 123-45-67',
        cityId: regCityId,
        sportId: regSportId,
        levelId: defaultLevelId,
      });
      onClose();
    } catch (err: any) {
      setRegError(err.message || 'Ошибка регистрации');
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSuccess(true);
    } catch (err) {
      setForgotSuccess(true);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>GroupGame Auth</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {tab === 'login' && 'Вход в аккаунт'}
            {tab === 'register' && 'Регистрация спортсмена'}
            {tab === 'forgot' && 'Восстановление доступа'}
            {tab === 'personas' && 'Демо-персоны и роли'}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {tab === 'login' && 'Войдите, чтобы записываться на игры и общаться с игроками'}
            {tab === 'register' && 'Создайте профиль и выберите интересующие виды спорта'}
            {tab === 'forgot' && 'Мы отправим инструкции для безопасного сброса пароля'}
            {tab === 'personas' && 'Быстрое переключение между готовыми тестовыми ролями'}
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 mt-5 bg-black/20 p-1 rounded-2xl">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Вход</span>
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Регистрация</span>
            </button>
            <button
              onClick={() => setTab('personas')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                tab === 'personas' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-amber-200 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Персоны</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email адрес
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="alexey.organizer@yandex.ru"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Пароль
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Забыли пароль?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loginLoading ? 'Авторизация...' : 'Войти в аккаунт'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Нет учетной записи?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Имя
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Сергей"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Морозов"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="sergey.morozov@mail.ru"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Телефон
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+7 (916) 123-45-67"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Город
                  </label>
                  <select
                    value={regCityId}
                    onChange={(e) => setRegCityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Основной вид спорта
                </label>
                <select
                  value={regSportId}
                  onChange={(e) => setRegSportId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{regLoading ? 'Создание аккаунта...' : 'Зарегистрироваться'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              {forgotSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-emerald-900 text-sm">Ссылка отправлена!</h3>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Мы отправили на почту <strong>{forgotEmail}</strong> инструкции по восстановлению пароля.
                  </p>
                  <button
                    onClick={() => {
                      setForgotSuccess(false);
                      setTab('login');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                  >
                    Вернуться ко входу
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email учетной записи
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="vash-email@mail.ru"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all"
                  >
                    {forgotLoading ? 'Отправка...' : 'Отправить ссылку для сброса'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      ← Вернуться к экрану входа
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: PERSONAS QUICK SWITCH */}
          {tab === 'personas' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Выберите готовую роль, чтобы протестировать различные пользовательские сценарии (организатор, игрок в очереди, нарушитель No-Show, администратор системы):
              </p>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const isAlexey = u.id === 'user-organizer-alexey';
                  const isElena = u.id === 'user-organizer-elena';
                  const isDmitry = u.id === 'user-player-dmitry';
                  const isPavel = u.id === 'user-player-pavel';
                  const isAnna = u.id === 'user-player-anna';

                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.firstName}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-slate-900">
                              {u.firstName} {u.lastName}
                            </span>
                            {u.roles.includes('Administrator') && (
                              <span className="text-[9px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-bold">
                                Админ
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-bold">
                                Текущий
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {isAlexey && '👑 Организатор волейбола / Club Elite'}
                            {isElena && '⚡ Организатор PRO / Волейбол'}
                            {isDmitry && '🏐 Игрок / Активный любитель (100% посещаемость)'}
                            {isPavel && '⚠️ Игрок с No-Show (для тестов черного списка и жалоб)'}
                            {isAnna && '⭐ Продвинутый игрок / Отличная репутация'}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Рейтинг: {u.stats.rating} ★ • Организовано: {u.stats.gamesOrganized} • Сыграно: {u.stats.gamesPlayed}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Активен' : 'Выбрать'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

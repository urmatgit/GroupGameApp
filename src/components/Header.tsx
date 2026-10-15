import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Bell,
  PlusCircle,
  Database,
  Shield,
  Calendar,
  User as UserIcon,
  Repeat,
  MapPin,
  Check,
  Award,
  Sparkles,
  BookOpen,
  Crown,
  LogIn,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'games' | 'my-games' | 'templates' | 'profile' | 'admin' | 'db';
  setCurrentTab: (tab: 'games' | 'my-games' | 'templates' | 'profile' | 'admin' | 'db') => void;
  onOpenCreateGame: () => void;
  onOpenAuth?: () => void;
  onOpenSubscriptions?: () => void;
  onOpenRules?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreateGame,
  onOpenAuth,
  onOpenSubscriptions,
  onOpenRules,
}) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    activeCityId,
    setActiveCityId,
  } = useAuth();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdmin =
    (currentUser?.roles || []).includes('Administrator') ||
    (currentUser?.roles || []).includes('Moderator') ||
    currentUser?.userRole === 'Admin' ||
    currentUser?.userRole === 'Organizer';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setCurrentTab('games')}
              className="flex items-center space-x-3 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-xl tracking-tight">G</span>
              </div>
              <div>
                <span className="font-black text-lg text-slate-900 tracking-tight block">GroupGame</span>
                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block -mt-1">
                  Спортивные игры
                </span>
              </div>
            </button>

            {/* City Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 text-xs font-medium text-slate-600 border border-slate-200">
              <MapPin className="w-3.5 h-3.5 ml-1 mr-1 text-slate-400" />
              <button
                onClick={() => setActiveCityId('city-1')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeCityId === 'city-1'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Москва
              </button>
              <button
                onClick={() => setActiveCityId('city-2')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeCityId === 'city-2'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Санкт-Петербург
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('games')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'games'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Все игры
            </button>
            <button
              onClick={() => setCurrentTab('my-games')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'my-games'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Мои игры
            </button>
            <button
              onClick={() => setCurrentTab('templates')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentTab === 'templates'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Шаблоны</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Админка</span>
              </button>
            )}

            <button
              onClick={() => setCurrentTab('db')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentTab === 'db'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL DDL</span>
            </button>
          </nav>

          {/* Right actions: Create Game, Notifications, Persona Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {onOpenRules && (
              <button
                onClick={onOpenRules}
                className="hidden xl:flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Справочник и правила"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Правила</span>
              </button>
            )}

            {onOpenSubscriptions && (
              <button
                onClick={onOpenSubscriptions}
                className="hidden lg:flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                title="Тарифы и подписка"
              >
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                <span>Тарифы</span>
              </button>
            )}

            {/* Create Game Button */}
            <button
              onClick={onOpenCreateGame}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Создать игру</span>
              <span className="sm:hidden">+</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Уведомления"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-800">Уведомления</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Прочитать все</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        У вас пока нет уведомлений
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.firstName}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="hidden lg:block pr-1 text-xs">
                  <div className="font-bold text-slate-800 flex items-center space-x-1">
                    <span>{currentUser.firstName}</span>
                    {((currentUser?.roles || []).includes('Administrator') || currentUser?.userRole === 'Admin') && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded font-semibold">Админ</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[100px]">
                    {currentUser.subscriptionPlanId === 'plan-club'
                      ? 'Клуб Elite'
                      : currentUser.subscriptionPlanId === 'plan-organizer'
                      ? 'Организатор'
                      : 'Бесплатный'}
                  </span>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Тестовый профиль (Переключение ролей)
                    </p>
                  </div>
                  <div className="py-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 flex items-center space-x-3 text-left hover:bg-slate-50 transition-colors ${
                          u.id === currentUser.id ? 'bg-blue-50/70 font-semibold' : ''
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={u.firstName}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-900 flex items-center justify-between">
                            <span className="font-bold truncate">{u.firstName} {u.lastName}</span>
                            {u.roles.includes('Administrator') && (
                              <span className="text-[9px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-bold ml-1">
                                Админ
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {u.id === 'user-organizer-alexey'
                              ? 'Организатор волейбола / Club Elite'
                              : u.id === 'user-player-dmitry'
                              ? 'Игрок / Любитель'
                              : u.id === 'user-organizer-elena'
                              ? 'Организатор PRO / Волейбол'
                              : u.id === 'user-player-pavel'
                              ? 'Игрок с No-Show (для тестов жалоб)'
                              : u.roles.join(', ')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 px-3 pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setCurrentTab('profile');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-center py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Мой профиль и статистика</span>
                    </button>

                    {onOpenSubscriptions && (
                      <button
                        onClick={() => {
                          onOpenSubscriptions();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-center py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Тарифы и подписка</span>
                      </button>
                    )}

                    {onOpenRules && (
                      <button
                        onClick={() => {
                          onOpenRules();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-center py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Правила платформы</span>
                      </button>
                    )}

                    {onOpenAuth && (
                      <button
                        onClick={() => {
                          onOpenAuth();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-center py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Вход / Регистрация / Сменить</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

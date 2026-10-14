import React, { useState, useEffect } from 'react';
import { User, Complaint, AuditLog, SubscriptionPlan, Game } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Shield,
  Users,
  Flag,
  Calendar,
  Activity,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Search,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'complaints' | 'audit' | 'plans'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [resStats, resUsers, resComplaints, resAudit, resPlans] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'x-user-id': currentUser.id } }),
        fetch('/api/admin/users', { headers: { 'x-user-id': currentUser.id } }),
        fetch('/api/admin/complaints', { headers: { 'x-user-id': currentUser.id } }),
        fetch('/api/admin/audit', { headers: { 'x-user-id': currentUser.id } }),
        fetch('/api/plans', { headers: { 'x-user-id': currentUser.id } }),
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resComplaints.ok) setComplaints(await resComplaints.json());
      if (resAudit.ok) setAuditLogs(await resAudit.json());
      if (resPlans.ok) setPlans(await resPlans.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [currentUser.id]);

  const handleToggleUserStatus = async (userId: string, currentStatus: User['status']) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveComplaint = async (
    complaintId: string,
    status: 'Resolved' | 'Dismissed',
    notes: string
  ) => {
    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        loadAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
            <Shield className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Административная панель</h1>
            <p className="text-xs text-purple-200 mt-0.5">
              Управление пользователями, модерация жалоб, журнал аудита и тарифные планы
            </p>
          </div>
        </div>

        <button
          onClick={loadAll}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          {loading ? 'Обновление...' : 'Обновить данные'}
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Всего игр
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalGames}</span>
            <span className="text-[11px] text-blue-600 font-semibold">{stats.activeGames} активных</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Пользователи
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalUsers}</span>
            <span className="text-[11px] text-slate-500">Зарегистрировано</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Посещаемость
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {stats.attendanceRate}%
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Явка участников</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Очереди Waitlist
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats.totalWaitlist}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Игроков в резерве</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Жалобы
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {stats.complaintsCount}
            </span>
            <span className="text-[11px] text-rose-700 font-medium">Требуют внимания</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              База данных
            </span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">18</span>
            <span className="text-[11px] text-purple-700 font-medium">Таблиц PostgreSQL</span>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Обзор и метрики
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'users'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Пользователи ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'complaints'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Жалобы ({complaints.filter((c) => c.status === 'Pending').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Журнал аудита</span>
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'plans'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Тарифы & Entitlements</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900">
              Управление пользователями и статусами
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Пользователь</th>
                  <th className="py-3 px-4">Роли</th>
                  <th className="py-3 px-4">Город</th>
                  <th className="py-3 px-4">Статистика явок</th>
                  <th className="py-3 px-4">Рейтинг</th>
                  <th className="py-3 px-4">Тариф</th>
                  <th className="py-3 px-4">Статус</th>
                  <th className="py-3 px-4 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={u.avatarUrl}
                          alt={u.firstName}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block truncate">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r === 'Administrator'
                                ? 'bg-purple-100 text-purple-700'
                                : r === 'Moderator'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{u.cityName}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-semibold">{u.stats.attendedCount} яв.</span>
                      {' / '}
                      <span className={u.stats.noShowCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                        {u.stats.noShowCount} неяв.
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-600">
                      ⭐ {u.stats.rating} ({u.stats.ratingsCount})
                    </td>
                    <td className="py-3 px-4 text-[11px] font-semibold text-slate-600">
                      {u.subscriptionPlanId === 'plan-club'
                        ? 'Club Elite'
                        : u.subscriptionPlanId === 'plan-organizer'
                        ? 'Pro'
                        : 'Free'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          u.status === 'Active'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'Active' ? 'Заблокировать' : 'Разблокировать'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            Жалобы пользователей на игроков и матчи
          </h3>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Жалоб пока нет</div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">
                        {c.reason}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        Жалоба от: {c.fromUserName}
                        {c.targetUserName && ` на игрока: ${c.targetUserName}`}
                      </h4>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : c.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.status === 'Pending'
                        ? 'На рассмотрении'
                        : c.status === 'Resolved'
                        ? 'Меры приняты'
                        : 'Отклонена'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/70">
                    {c.description}
                  </p>

                  {c.gameTitle && (
                    <div className="text-[11px] text-slate-500">
                      Матч: <strong>{c.gameTitle}</strong>
                    </div>
                  )}

                  {c.status === 'Pending' && (
                    <div className="pt-2 flex items-center justify-end space-x-2">
                      <button
                        onClick={() =>
                          handleResolveComplaint(c.id, 'Dismissed', 'Нарушений не выявлено')
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700"
                      >
                        Отклонить
                      </button>
                      <button
                        onClick={() =>
                          handleResolveComplaint(
                            c.id,
                            'Resolved',
                            'Пользователю вынесено предупреждение в журнале аудита'
                          )
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                      >
                        Принять меры (Блокировка / Предупреждение)
                      </button>
                    </div>
                  )}

                  {c.resolutionNotes && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 border border-emerald-200">
                      <strong>Решение ({c.resolvedByName}):</strong> {c.resolutionNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            Журнал аудита критических административных действий
          </h3>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({log.entityName})</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              Архитектура и целостность данных
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Сервер является единым источником истины (Source of Truth). Все критические проверки
              прав и квот происходят на backend. Запись в очередь ожидания реализована с гарантией FIFO
              и защитой от переполнения через серверные транзакции.
            </p>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900">
              <span className="font-bold block mb-1">Ключевые проверки безопасности:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Строгая валидация личного чёрного списка организатора при записи</li>
                <li>Автоматическое продвижение первого в очереди при отмене участника</li>
                <li>Контроль cancellation deadline дедлайна отмены (за 3 часа)</li>
                <li>Учёт статистики No-Show в профиле игрока</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900">Модель подписок и Entitlements</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              В соответствии с разделом 5 ТЗ система не использует примитивный флаг IsPremium. Все
              привилегии разделены на гранулярные права (Entitlements).
            </p>
            <div className="space-y-2">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900">{p.name}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.entitlements.map((code) => (
                        <span
                          key={code}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-100 text-blue-800"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-800">
                    {p.price === 0 ? 'Бесплатно' : `${p.price} ₽/${p.period}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PLANS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Тариф
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">{plan.name}</h3>
                <div className="mt-2 text-2xl font-black text-slate-900">
                  {plan.price === 0 ? '0 ₽' : `${plan.price} ₽`}
                  <span className="text-xs text-slate-400 font-normal"> / {plan.period}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{plan.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Включенные Entitlements:
                </span>
                <div className="space-y-1.5">
                  {plan.entitlements.map((e) => (
                    <div key={e} className="flex items-center space-x-1.5 text-xs text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="font-mono text-[11px] font-semibold">{e}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

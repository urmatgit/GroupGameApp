import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { BlacklistEntry, Sport, Rating } from '../types/index.ts';
import {
  User,
  Star,
  CheckCircle,
  XCircle,
  Shield,
  Award,
  UserX,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Crown,
  Edit2,
  MessageSquare,
  X,
  Save,
  Phone,
  MapPin,
  Image,
} from 'lucide-react';

interface ProfileViewProps {
  sports: Sport[];
  onOpenSubscriptions?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ sports, onOpenSubscriptions }) => {
  const { currentUser, allUsers, refreshUser, updateProfile } = useAuth();
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('Систематические опоздания и грубость');
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState(currentUser.firstName);
  const [editLastName, setEditLastName] = useState(currentUser.lastName);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser.avatarUrl);
  const [editLoading, setEditLoading] = useState(false);

  const fetchBlacklist = async () => {
    try {
      const res = await fetch('/api/blacklist', {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setBlacklist(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await fetch(`/api/users/${currentUser.id}/ratings`);
      if (res.ok) {
        setRatings(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBlacklist();
    fetchRatings();
    setEditFirstName(currentUser.firstName);
    setEditLastName(currentUser.lastName);
    setEditPhone(currentUser.phone);
    setEditAvatarUrl(currentUser.avatarUrl);
  }, [currentUser.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await updateProfile({
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        avatarUrl: editAvatarUrl,
      });
      setShowEditProfile(false);
      refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddToBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToBlock) return;
    try {
      const res = await fetch('/api/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          blockedUserId: selectedUserToBlock,
          reason: blockReason,
        }),
      });
      if (res.ok) {
        setSelectedUserToBlock('');
        setShowBlockForm(false);
        fetchBlacklist();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveFromBlacklist = async (blockedUserId: string) => {
    try {
      const res = await fetch(`/api/blacklist/${blockedUserId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        fetchBlacklist();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const attendancePercent =
    currentUser.stats.gamesPlayed > 0
      ? Math.round(
          (currentUser.stats.attendedCount /
            (currentUser.stats.attendedCount + currentUser.stats.noShowCount || 1)) *
            100
        )
      : 100;

  const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.firstName}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {currentUser.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser.email} • {currentUser.phone}
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">
              г. {currentUser.cityName} • В клубе с {new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}
            </p>
            <div className="mt-2.5 flex items-center space-x-2">
              <button
                onClick={() => setShowEditProfile(true)}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Редактировать</span>
              </button>
              {onOpenSubscriptions && (
                <button
                  onClick={onOpenSubscriptions}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors flex items-center space-x-1"
                >
                  <Crown className="w-3 h-3" />
                  <span>Тариф: {currentUser.subscriptionPlanId === 'plan-club' ? 'Club' : currentUser.subscriptionPlanId === 'plan-organizer' ? 'Pro' : 'Free'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Big Rating Pill */}
        <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-amber-500 font-black text-xl">
              <Star className="w-5 h-5 fill-current" />
              <span>{currentUser.stats.rating}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              {currentUser.stats.ratingsCount} оценок
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-center">
            <span className="text-xl font-black text-emerald-600">{attendancePercent}%</span>
            <span className="text-[10px] text-slate-400 font-semibold block">Посещаемость</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Сыграно матчей
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {currentUser.stats.gamesPlayed}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Организовано игр
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {currentUser.stats.gamesOrganized}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Успешных явок
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {currentUser.stats.attendedCount}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Пропуски (No-Show)
          </span>
          <span
            className={`text-2xl font-black mt-1 block ${
              currentUser.stats.noShowCount > 0 ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            {currentUser.stats.noShowCount}
          </span>
        </div>
      </div>

      {/* Sports & Subscription */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sports Proficiency */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Мои виды спорта и разряды</h3>
          <div className="space-y-2">
            {currentUser.sports.map((us) => {
              const sport = sports.find((s) => s.id === us.sportId);
              const level = sport?.levels.find((l) => l.id === us.levelId);
              return (
                <div
                  key={us.sportId}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <span className="font-bold text-xs text-slate-900">
                    {sport?.icon} {sport?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                    {level?.name || 'Любитель'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription Plan & Entitlements */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Тариф и привилегии (Entitlements)</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              {currentUser.subscriptionPlanId === 'plan-club'
                ? 'Club Elite'
                : currentUser.subscriptionPlanId === 'plan-organizer'
                ? 'Pro Организатор'
                : 'Free'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Права на создание матчей и шаблонов определяются на сервере через таблицу plan_entitlements.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-100 text-slate-700 font-bold">
              ✓ ADVANCED_SEARCH
            </span>
            {currentUser.subscriptionPlanId !== 'plan-free' && (
              <span className="px-2 py-1 rounded-lg text-[10px] font-mono bg-blue-100 text-blue-800 font-bold">
                ✓ CREATE_GAME
              </span>
            )}
            {currentUser.subscriptionPlanId === 'plan-club' && (
              <span className="px-2 py-1 rounded-lg text-[10px] font-mono bg-purple-100 text-purple-800 font-bold">
                ✓ CREATE_RECURRING_GAME
              </span>
            )}
            <span className="px-2 py-1 rounded-lg text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
              ✓ ATTENDANCE_TRACKING
            </span>
          </div>

          {onOpenSubscriptions && (
            <div className="pt-2">
              <button
                onClick={onOpenSubscriptions}
                className="text-xs text-purple-600 font-bold hover:underline flex items-center space-x-1"
              >
                <span>Управление тарифным планом →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Received Reviews and Ratings */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <span>Отзывы и оценки от игроков и организаторов</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{ratings.length} отзывов</span>
        </div>

        {ratings.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
            У вас пока нет отзывов. Участвуйте в играх, и другие игроки смогут поставить вам оценку!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ratings.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= r.stars ? 'fill-current' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                {r.reviewText && (
                  <p className="text-xs text-slate-700 italic">«{r.reviewText}»</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organizer Personal Blacklist (Section 13) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <UserX className="w-5 h-5 text-rose-600" />
              <span>Личный чёрный список организатора (Раздел 13 ТЗ)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Заблокированные здесь игроки не смогут записаться ни в одну вашу будущую игру
            </p>
          </div>

          <button
            onClick={() => setShowBlockForm(!showBlockForm)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить игрока в блок</span>
          </button>
        </div>

        {/* Add Block Form */}
        {showBlockForm && (
          <form
            onSubmit={handleAddToBlacklist}
            className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3 animate-in fade-in"
          >
            <h4 className="text-xs font-bold text-rose-900">Блокировка доступа к вашим матчам</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Игрок *</label>
                <select
                  required
                  value={selectedUserToBlock}
                  onChange={(e) => setSelectedUserToBlock(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-rose-200 rounded-xl"
                >
                  <option value="">-- Выберите игрока --</option>
                  {otherUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Причина</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-rose-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBlockForm(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Заблокировать игрока
              </button>
            </div>
          </form>
        )}

        {/* Blacklist entries */}
        <div className="space-y-2">
          {blacklist.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
              Ваш личный чёрный список пуст. Вы можете добавить сюда проблемных игроков с частыми неявками.
            </div>
          ) : (
            blacklist.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={entry.blockedUser.avatarUrl}
                    alt={entry.blockedUser.firstName}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      {entry.blockedUser.firstName} {entry.blockedUser.lastName}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Причина: {entry.reason || 'Без указания причины'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFromBlacklist(entry.blockedUserId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Разблокировать"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Редактирование профиля</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Имя</label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Фамилия</label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ссылка на аватар (URL)</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {editLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

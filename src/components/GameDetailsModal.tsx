import React, { useState } from 'react';
import { Game } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  AlertTriangle,
  Star,
  CheckCircle,
  Clock3,
  LogOut,
  Award,
  Flag,
  Share2,
  Repeat,
} from 'lucide-react';

interface GameDetailsModalProps {
  game: Game;
  onClose: () => void;
  onJoin: (gameId: string) => void;
  onLeave: (gameId: string, reason?: string) => void;
  onCancelGame: (gameId: string, reason: string) => void;
  onOpenAttendance: (game: Game) => void;
  onOpenRating: (game: Game) => void;
  onOpenComplaint: (game: Game, targetUserId?: string) => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  onClose,
  onJoin,
  onLeave,
  onCancelGame,
  onOpenAttendance,
  onOpenRating,
  onOpenComplaint,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'roster' | 'rules'>('roster');
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [gameCancelReason, setGameCancelReason] = useState('');
  const [showGameCancelPrompt, setShowGameCancelPrompt] = useState(false);

  const userParticipant = game.participants.find(
    (p) => p.userId === currentUser.id && (p.status === 'Main' || p.status === 'Waitlist')
  );

  const isMain = userParticipant?.status === 'Main';
  const isWaitlist = userParticipant?.status === 'Waitlist';
  const isOrganizer = game.organizerId === currentUser.id;
  const isAdmin = currentUser.roles.includes('Administrator') || currentUser.roles.includes('Moderator');

  const isFull = game.mainCount >= game.maxPlayers;
  const isCompleted = game.status === 'Completed';
  const isCancelled = game.status === 'Cancelled';

  const startDate = new Date(game.startDateTime);
  const formattedDate = startDate.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const mainParticipants = game.participants.filter((p) => p.status === 'Main');
  const waitlistParticipants = game.participants
    .filter((p) => p.status === 'Waitlist')
    .sort((a, b) => (a.queuePosition ?? 999) - (b.queuePosition ?? 999));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-sm text-white">
              {game.sportName}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/15 text-white/90">
              {game.levelName}
            </span>
            {game.templateId && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/40 text-white flex items-center space-x-1">
                <Repeat className="w-3.5 h-3.5" />
                <span>Регулярная игра</span>
              </span>
            )}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                isCancelled
                  ? 'bg-rose-500 text-white'
                  : isCompleted
                  ? 'bg-slate-700 text-white'
                  : isFull
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {isCancelled
                ? 'Отменена'
                : isCompleted
                ? 'Завершена'
                : isFull
                ? 'Мест нет (Waitlist открыт)'
                : 'Идёт набор игроков'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {game.title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90 font-medium">
            <span className="flex items-center space-x-1.5 capitalize">
              <Calendar className="w-4 h-4 text-blue-200" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-blue-200" />
              <span>{formattedTime} ({game.timeZone})</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Info grid: Venue, Price, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Площадка
              </span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {game.venueName}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {game.venueAddress}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Стоимость участия
              </span>
              <span className="text-sm font-black text-slate-900 mt-1 block">
                {game.price === 0 ? 'Бесплатно' : `${game.price} ₽`}
              </span>
              <span className="text-[11px] text-slate-500">с человека</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Срок отмены
              </span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                За {game.cancellationDeadlineHours} ч. до начала
              </span>
              <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
                Строгий дедлайн
              </span>
            </div>
          </div>

          {/* Organizer card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center space-x-3">
              <img
                src={game.organizer.avatarUrl}
                alt={game.organizer.firstName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm"
              />
              <div>
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  Организатор матча
                </span>
                <span className="text-sm font-bold text-slate-900 block">
                  {game.organizer.firstName} {game.organizer.lastName}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-blue-200/50">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span className="text-xs font-bold text-slate-800">{game.organizer.rating}</span>
            </div>
          </div>

          {/* Tabs: Roster & Waitlist / Rules & Description */}
          <div>
            <div className="flex border-b border-slate-200 mb-4">
              <button
                onClick={() => setActiveTab('roster')}
                className={`pb-2.5 text-sm font-bold mr-6 relative transition-colors ${
                  activeTab === 'roster' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Состав ({mainParticipants.length}/{game.maxPlayers})
                {waitlistParticipants.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                    +{waitlistParticipants.length} в очереди
                  </span>
                )}
                {activeTab === 'roster' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('rules')}
                className={`pb-2.5 text-sm font-bold relative transition-colors ${
                  activeTab === 'rules' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Правила и описание
                {activeTab === 'rules' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            </div>

            {/* TAB CONTENT: ROSTER */}
            {activeTab === 'roster' && (
              <div className="space-y-4">
                {/* Main Roster List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Основной состав ({mainParticipants.length} из {game.maxPlayers})</span>
                    <span className="text-[11px] font-normal text-emerald-600">
                      Свободно мест: {Math.max(0, game.maxPlayers - mainParticipants.length)}
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mainParticipants.map((p, idx) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          p.userId === currentUser.id
                            ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-200'
                            : 'bg-white border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="w-5 text-[11px] font-bold text-slate-400 text-center">
                            #{idx + 1}
                          </span>
                          <img
                            src={p.user.avatarUrl}
                            alt={p.user.firstName}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">
                              {p.user.firstName} {p.user.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Рейтинг: ⭐ {p.user.rating}
                            </span>
                          </div>
                        </div>

                        {p.userId === game.organizerId ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            Организатор
                          </span>
                        ) : p.userId === currentUser.id ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Вы
                          </span>
                        ) : (
                          <button
                            onClick={() => onOpenComplaint(game, p.userId)}
                            title="Пожаловаться на игрока"
                            className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Waitlist (Очередь ожидания) FIFO */}
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Clock3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Резервная очередь FIFO ({waitlistParticipants.length})</span>
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Автопродвижение при отмене
                    </span>
                  </h4>

                  {waitlistParticipants.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      В очереди ожидания сейчас никого нет.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {waitlistParticipants.map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            p.userId === currentUser.id
                              ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-200'
                              : 'bg-white border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="px-2 py-0.5 rounded-md text-xs font-black bg-amber-200 text-amber-900">
                              #{p.queuePosition}
                            </span>
                            <img
                              src={p.user.avatarUrl}
                              alt={p.user.firstName}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">
                                {p.user.firstName} {p.user.lastName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Записан в очередь
                              </span>
                            </div>
                          </div>

                          {p.userId === currentUser.id && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Ваша позиция
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RULES & DESCRIPTION */}
            {activeTab === 'rules' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Описание игры:</span>
                  <p>{game.description}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Правила и требования к участникам:</span>
                  <p>{game.rules}</p>
                </div>

                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold flex items-center space-x-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Политика отмены и штрафы за неявку:</span>
                  </span>
                  <p>
                    Самостоятельная отмена записи возможна не позднее чем за{' '}
                    <strong>{game.cancellationDeadlineHours} часа</strong> до начала. Если вы отменили
                    участие вовремя, первый игрок из очереди ожидания автоматически займёт ваше место. Неявка
                    без предупреждения фиксируется организатором как No-Show и понижает ваш рейтинг.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {/* Left buttons: Report game */}
            <button
              onClick={() => onOpenComplaint(game)}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center space-x-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Пожаловаться</span>
            </button>

            {/* Right main action buttons */}
            <div className="flex items-center space-x-2">
              {/* If user is active in game: Leave button */}
              {(isMain || isWaitlist) && !isCompleted && !isCancelled && (
                <div>
                  {!showCancelPrompt ? (
                    <button
                      onClick={() => setShowCancelPrompt(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isMain ? 'Отменить участие' : 'Покинуть очередь'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-rose-50 p-2 rounded-xl border border-rose-300">
                      <input
                        type="text"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Причина отмены..."
                        className="text-xs px-2 py-1 bg-white border border-rose-200 rounded-lg focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          onLeave(game.id, cancellationReason);
                          setShowCancelPrompt(false);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700"
                      >
                        Подтвердить
                      </button>
                      <button
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* If not joined and active game: Join or Waitlist */}
              {!isMain && !isWaitlist && !isCompleted && !isCancelled && (
                <button
                  onClick={() => onJoin(game.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${
                    isFull
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  {isFull ? 'Встать в очередь (Waitlist)' : 'Записаться на игру'}
                </button>
              )}

              {/* If completed: Attendance (for organizer) & Rating (for participants) */}
              {isCompleted && (
                <div className="flex items-center space-x-2">
                  {(isOrganizer || isAdmin) && (
                    <button
                      onClick={() => onOpenAttendance(game)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Отметить посещаемость</span>
                    </button>
                  )}
                  {isMain && (
                    <button
                      onClick={() => onOpenRating(game)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center space-x-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Оценить игроков</span>
                    </button>
                  )}
                </div>
              )}

              {/* Organizer / Admin: Cancel game */}
              {(isOrganizer || isAdmin) && !isCompleted && !isCancelled && (
                <div>
                  {!showGameCancelPrompt ? (
                    <button
                      onClick={() => setShowGameCancelPrompt(true)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Отменить игру
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-xl">
                      <input
                        type="text"
                        value={gameCancelReason}
                        onChange={(e) => setGameCancelReason(e.target.value)}
                        placeholder="Причина отмены игры..."
                        className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          onCancelGame(game.id, gameCancelReason || 'Отменено организатором');
                          setShowGameCancelPrompt(false);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700"
                      >
                        Отменить
                      </button>
                      <button
                        onClick={() => setShowGameCancelPrompt(false)}
                        className="text-xs text-slate-500"
                      >
                        Назад
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

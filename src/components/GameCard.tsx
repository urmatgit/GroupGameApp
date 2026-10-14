import React from 'react';
import { Game } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  CheckCircle,
  Clock3,
  AlertCircle,
  Repeat,
  ShieldCheck,
} from 'lucide-react';

interface GameCardProps {
  game: Game;
  onOpenDetails: (game: Game) => void;
  onQuickJoin: (gameId: string) => void;
  onQuickLeave: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onOpenDetails,
  onQuickJoin,
  onQuickLeave,
}) => {
  const { currentUser } = useAuth();

  const userParticipant = game.participants.find(
    (p) => p.userId === currentUser.id && (p.status === 'Main' || p.status === 'Waitlist')
  );

  const isMain = userParticipant?.status === 'Main';
  const isWaitlist = userParticipant?.status === 'Waitlist';

  const isOrganizer = game.organizerId === currentUser.id;
  const isFull = game.mainCount >= game.maxPlayers;
  const isCompleted = game.status === 'Completed';
  const isCancelled = game.status === 'Cancelled';

  const startDate = new Date(game.startDateTime);
  const formattedDate = startDate.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = startDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const percentFull = Math.min(100, Math.round((game.mainCount / game.maxPlayers) * 100));

  return (
    <div
      onClick={() => onOpenDetails(game)}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
    >
      <div>
        {/* Header: Sport, Level, Status Badge */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100/80 text-blue-800">
                {game.sportName}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700">
                {game.levelName}
              </span>
              {game.templateId && (
                <span
                  title="Регулярная игра по шаблону"
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-600 flex items-center space-x-1"
                >
                  <Repeat className="w-3 h-3" />
                  <span>Регулярная</span>
                </span>
              )}
            </div>

            {/* Game Status Badge */}
            <div>
              {isCancelled ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  Отменена
                </span>
              ) : isCompleted ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  Завершена
                </span>
              ) : isFull ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                  <Clock3 className="w-3 h-3" />
                  <span>Очередь (Full)</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Набор открыт</span>
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-slate-900 mt-2.5 group-hover:text-blue-600 transition-colors line-clamp-1">
            {game.title}
          </h3>

          {/* Date, Time, Venue */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center space-x-3 text-slate-700 font-medium">
              <span className="flex items-center space-x-1 text-slate-900 font-semibold capitalize">
                <Calendar className="w-3.5 h-3.5 text-blue-600 mr-1" />
                {formattedDate}
              </span>
              <span className="flex items-center space-x-1 text-slate-900 font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-600 mr-1" />
                {formattedTime}
              </span>
              <span className="text-[11px] text-slate-400">({game.timeZone.split('/')[1] || 'МСК'})</span>
            </div>

            <div className="flex items-start space-x-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1 text-[11px] font-medium">{game.venueName} • {game.venueAddress}</span>
            </div>
          </div>
        </div>

        {/* Roster Progress Bar */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
            <div className="flex items-center space-x-1 text-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Участники: <strong className="text-slate-900">{game.mainCount}</strong> / {game.maxPlayers}
              </span>
            </div>
            {game.waitlistCount > 0 && (
              <span className="text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                {game.waitlistCount} в очереди Waitlist
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentFull >= 100
                  ? 'bg-amber-500'
                  : percentFull > 75
                  ? 'bg-blue-600'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentFull}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Organizer, Price, Join / Waitlist Action */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
        {/* Organizer info */}
        <div className="flex items-center space-x-2 min-w-0">
          <img
            src={game.organizer.avatarUrl}
            alt={game.organizer.firstName}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-800 block truncate leading-tight">
              {game.organizer.firstName} {game.organizer.lastName[0]}.
            </span>
            <div className="flex items-center space-x-0.5 text-[10px] text-amber-500 font-bold">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{game.organizer.rating}</span>
            </div>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              {game.price === 0 ? 'Бесплатно' : `${game.price} ₽`}
            </span>
            <span className="text-[10px] text-slate-400">за игрока</span>
          </div>

          {/* User state badge / Quick button */}
          {isMain ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>В составе</span>
            </div>
          ) : isWaitlist ? (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center space-x-1">
              <Clock3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Очередь #{userParticipant.queuePosition}</span>
            </div>
          ) : isCompleted || isCancelled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(game);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Подробнее
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickJoin(game.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isFull
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isFull ? 'В очередь (FIFO)' : 'Записаться'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

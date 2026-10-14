import React, { useState } from 'react';
import { Sport, Venue } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Calendar, Clock, MapPin, Users, DollarSign, AlertCircle, Sparkles } from 'lucide-react';

interface CreateGameModalProps {
  sports: Sport[];
  venues: Venue[];
  onClose: () => void;
  onCreated: () => void;
}

export const CreateGameModal: React.FC<CreateGameModalProps> = ({
  sports,
  venues,
  onClose,
  onCreated,
}) => {
  const { currentUser } = useAuth();

  const [sportId, setSportId] = useState(sports[0]?.id || '');
  const [levelId, setLevelId] = useState(sports[0]?.levels[0]?.id || '');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:30');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [maxPlayers, setMaxPlayers] = useState(12);
  const [price, setPrice] = useState(600);
  const [description, setDescription] = useState(
    'Дружеский сбор. Играем с расстановкой 5-1, разминка 15 минут.'
  );
  const [rules, setRules] = useState(
    'Чистая сменная обувь с немаркой подошвой, пунктуальность, уважение к соперникам.'
  );
  const [cancellationDeadlineHours, setCancellationDeadlineHours] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSport = sports.find((s) => s.id === sportId);

  const handleSportChange = (id: string) => {
    setSportId(id);
    const sp = sports.find((s) => s.id === id);
    if (sp && sp.levels.length > 0) {
      setLevelId(sp.levels[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const startDateTime = new Date(`${date}T${time}:00`).toISOString();
      const endDateTime = new Date(
        new Date(startDateTime).getTime() + durationMinutes * 60000
      ).toISOString();

      const gameTitle =
        title.trim() ||
        `${selectedSport?.name || 'Игра'} в ${venues.find((v) => v.id === venueId)?.name || 'зале'}`;

      const res = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          sportId,
          levelId,
          venueId,
          title: gameTitle,
          startDateTime,
          endDateTime,
          maxPlayers: Number(maxPlayers),
          price: Number(price),
          description,
          rules,
          cancellationDeadlineHours: Number(cancellationDeadlineHours),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка создания игры');
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-slate-900 text-base">Создание спортивной игры</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sport & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Вид спорта *
              </label>
              <select
                value={sportId}
                onChange={(e) => handleSportChange(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Уровень участников *
              </label>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedSport?.levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Название матча
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Вечерний волейбол 5-1 / Сокол"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Спортивная площадка / Зал *
            </label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.address})
                </option>
              ))}
            </select>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Дата игры *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Время начала *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Длительность (мин) *
              </label>
              <input
                type="number"
                min={30}
                step={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Max Players, Price, Cancellation Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Макс. игроков *
              </label>
              <input
                type="number"
                min={2}
                max={50}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Цена (₽ / 0 = Бесплатно) *
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Дедлайн отмены (ч) *
              </label>
              <input
                type="number"
                min={1}
                max={48}
                value={cancellationDeadlineHours}
                onChange={(e) => setCancellationDeadlineHours(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rules and Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Правила и требования к обуви/форме
            </label>
            <textarea
              rows={2}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Опубликовать игру'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

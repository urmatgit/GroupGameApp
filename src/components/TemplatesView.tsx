import React, { useState, useEffect } from 'react';
import { GameTemplate, Sport, Venue } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Repeat, Plus, Calendar, Clock, MapPin, Users, Check, AlertCircle } from 'lucide-react';

interface TemplatesViewProps {
  sports: Sport[];
  venues: Venue[];
  onGameCreated: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ sports, venues, onGameCreated }) => {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('Еженедельный волейбол 5-1');
  const [sportId, setSportId] = useState(sports[0]?.id || '');
  const [levelId, setLevelId] = useState(sports[0]?.levels[0]?.id || '');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [startTime, setStartTime] = useState('19:30');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [selectedDays, setSelectedDays] = useState<number[]>([3]); // Wednesday
  const [maxPlayers, setMaxPlayers] = useState(12);
  const [price, setPrice] = useState(600);
  const [description, setDescription] = useState('Регулярный волейбол каждую среду.');
  const [rules, setRules] = useState('Сменная чистая обувь non-marking.');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/game-templates', {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [currentUser.id]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/game-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          sportId,
          levelId,
          venueId,
          name,
          startTime,
          durationMinutes: Number(durationMinutes),
          recurrenceType: 'Weekly',
          daysOfWeek: selectedDays,
          startDate: new Date().toISOString().split('T')[0],
          maxPlayers: Number(maxPlayers),
          price: Number(price),
          description,
          rules,
          cancellationDeadlineHours: 3,
          isActive: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка создания шаблона');
      }

      setShowCreate(false);
      fetchTemplates();
      onGameCreated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
            <Repeat className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Регулярные игры и шаблоны</h1>
            <p className="text-xs text-blue-200 mt-0.5">
              Автоматическая генерация матчей (GameTemplates) с повторением по расписанию (Раздел 7 ТЗ)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-white text-blue-800 hover:bg-blue-50 shadow-md transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreate ? 'Скрыть форму' : 'Создать регулярный шаблон'}</span>
        </button>
      </div>

      {/* Create Form Dropdown */}
      {showCreate && (
        <form
          onSubmit={handleCreateTemplate}
          className="bg-white p-6 rounded-3xl border border-blue-200 shadow-md space-y-4 animate-in fade-in"
        >
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Repeat className="w-4 h-4 text-blue-600" />
            <span>Настройка повторяющегося расписания (Шаблон)</span>
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Название шаблона *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Вид спорта *</label>
              <select
                value={sportId}
                onChange={(e) => {
                  setSportId(e.target.value);
                  const sp = sports.find((s) => s.id === e.target.value);
                  if (sp && sp.levels.length > 0) setLevelId(sp.levels[0].id);
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Дни недели повторения *</label>
            <div className="flex items-center space-x-2">
              {dayNames.map((dayLabel, idx) => {
                const dayNum = idx + 1;
                const isSelected = selectedDays.includes(dayNum);
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => toggleDay(dayNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dayLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Площадка *</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Время начала *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Длительность (мин) *</label>
              <input
                type="number"
                min={30}
                step={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              Сохранить шаблон и создать ближайшую игру
            </button>
          </div>
        </form>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            У вас пока нет сохранённых шаблонов регулярных игр. Переключитесь на Алексея или Елену
            для просмотра шаблонов организатора.
          </div>
        ) : (
          templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                    {tmpl.recurrenceType}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">{tmpl.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Активен
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{tmpl.startTime} ({tmpl.durationMinutes} мин)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>до {tmpl.maxPlayers} игроков</span>
                </span>
              </div>

              <div className="flex items-center space-x-1 pt-1">
                <span className="text-[11px] text-slate-400 mr-2">Дни:</span>
                {dayNames.map((d, idx) => {
                  const dayNum = idx + 1;
                  const active = tmpl.daysOfWeek.includes(dayNum);
                  return (
                    <span
                      key={dayNum}
                      className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ${
                        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>

              <p className="text-xs text-slate-600 border-t border-slate-100 pt-2 leading-relaxed">
                {tmpl.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Game, AttendanceStatus, GameAttendance } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { X, CheckCircle, XCircle, AlertCircle, Save, Users } from 'lucide-react';

interface AttendanceModalProps {
  game: Game;
  onClose: () => void;
  onSaved: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  game,
  onClose,
  onSaved,
}) => {
  const { currentUser } = useAuth();
  const mainParticipants = game.participants.filter((p) => p.status === 'Main');

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch existing attendance if available
    const fetchExisting = async () => {
      try {
        const res = await fetch(`/api/games/${game.id}/attendance`);
        if (res.ok) {
          const list: GameAttendance[] = await res.json();
          const map: Record<string, AttendanceStatus> = {};
          list.forEach((item) => {
            map[item.userId] = item.status;
          });
          // For any not marked, default to 'Attended'
          mainParticipants.forEach((p) => {
            if (!map[p.userId]) {
              map[p.userId] = 'Attended';
            }
          });
          setAttendanceMap(map);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchExisting();
  }, [game.id]);

  const handleStatusChange = (userId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [userId]: status }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = Object.entries(attendanceMap).map(([userId, status]) => ({
        userId,
        status,
      }));

      const res = await fetch(`/api/games/${game.id}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ records }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка сохранения посещаемости');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Отметка посещаемости</h2>
              <span className="text-[11px] text-slate-500 block truncate max-w-xs">{game.title}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Отметьте присутствие каждого игрока из основного состава. Статус <strong>NoShow (Неявка)</strong> влияет
            на репутацию игрока и отображается в его профиле.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {mainParticipants.map((p) => {
              const currentStatus = attendanceMap[p.userId] || 'Attended';
              return (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={p.user.avatarUrl}
                      alt={p.user.firstName}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {p.user.firstName} {p.user.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.userId === game.organizerId ? 'Организатор' : 'Игрок'}
                      </span>
                    </div>
                  </div>

                  {/* Radio buttons for status */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(p.userId, 'Attended')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        currentStatus === 'Attended'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Был ✅
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(p.userId, 'NoShow')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        currentStatus === 'NoShow'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Не явился ❌
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(p.userId, 'Excused')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        currentStatus === 'Excused'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Уваж. ⚠️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Сохранение...' : 'Зафиксировать посещаемость'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

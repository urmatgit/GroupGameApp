import React, { useState } from 'react';
import { Game } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Flag, AlertCircle, Send } from 'lucide-react';

interface ComplaintModalProps {
  game?: Game;
  targetUserId?: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  game,
  targetUserId,
  onClose,
  onSubmitted,
}) => {
  const { currentUser, allUsers } = useAuth();
  const targetUser = targetUserId ? allUsers.find((u) => u.id === targetUserId) : undefined;

  const [reason, setReason] = useState('Неспортивное поведение / грубость');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = [
    'Неспортивное поведение / грубость',
    'Систематическая неявка без предупреждения (No-Show)',
    'Несоответствие заявленному уровню игры',
    'Нарушение правил площадки / порча инвентаря',
    'Мошенничество или ввод в заблуждение',
    'Другое',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Пожалуйста, опишите суть нарушения подробнее');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          gameId: game?.id,
          targetUserId,
          reason,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка отправки жалобы');
      }

      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <Flag className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-slate-900 text-base">Подача жалобы</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
            {targetUser && (
              <div>
                <span className="text-slate-400">Нарушитель: </span>
                <strong className="text-slate-800">{targetUser.firstName} {targetUser.lastName}</strong>
              </div>
            )}
            {game && (
              <div>
                <span className="text-slate-400">Матч: </span>
                <strong className="text-slate-800">{game.title}</strong>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Причина жалобы *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Подробное описание ситуации *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите, что произошло. Модерация проверит журнал аудита и историю матча..."
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Отправка...' : 'Отправить жалобу'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

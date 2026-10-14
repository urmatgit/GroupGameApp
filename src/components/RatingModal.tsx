import React, { useState } from 'react';
import { Game } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Star, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface RatingModalProps {
  game: Game;
  onClose: () => void;
  onRated: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  game,
  onClose,
  onRated,
}) => {
  const { currentUser } = useAuth();
  // Eligible targets: Main participants excluding currentUser
  const eligibleTargets = game.participants.filter(
    (p) => p.status === 'Main' && p.userId !== currentUser.id
  );

  const [toUserId, setToUserId] = useState(eligibleTargets[0]?.userId || '');
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId) {
      setError('Выберите игрока для оценки');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/${game.id}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          toUserId,
          stars,
          reviewText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка отправки отзыва');
      }

      onRated();
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
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Star className="w-4 h-4 fill-current" />
            </span>
            <h2 className="font-bold text-slate-900 text-base">Оценка и отзыв</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Оцените игру и командное взаимодействие с участником матча «{game.title}».
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {eligibleTargets.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              В игре нет других участников для оценки.
            </div>
          ) : (
            <>
              {/* Select Player */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Кого хотите оценить? *
                </label>
                <select
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eligibleTargets.map((p) => (
                    <option key={p.userId} value={p.userId}>
                      {p.user.firstName} {p.user.lastName} {p.userId === game.organizerId ? '(Организатор)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating 1..5 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  Оценка ({stars} из 5)
                </label>
                <div className="flex items-center justify-center space-x-2 py-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setStars(val)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          val <= stars
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Комментарий (необязательно)
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Отличный приём мяча, отличная позиционная игра..."
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
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Отправка...' : 'Отправить отзыв'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

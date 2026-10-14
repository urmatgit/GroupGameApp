import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Users,
  Clock,
  Award,
  ShieldAlert,
  AlertTriangle,
  Repeat,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'waitlist' | 'cancellation' | 'attendance' | 'ratings' | 'fairplay'>('waitlist');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Справочник и правила платформы</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Правила и регламент GroupGame
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
            Подробное руководство по участию, алгоритмам очереди, отмене записей, посещаемости и системе рейтинга игроков.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1.5 mt-5 bg-black/30 p-1 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'waitlist' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Очередь (FIFO Waitlist)
            </button>
            <button
              onClick={() => setActiveTab('cancellation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'cancellation' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Отмена записи (3 часа)
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'attendance' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Посещаемость и No-Show
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'ratings' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Рейтинг и отзывы
            </button>
            <button
              onClick={() => setActiveTab('fairplay')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'fairplay' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Fair Play и жалобы
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'waitlist' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-blue-600">
                <Users className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">
                  Как работает очередь ожидания (FIFO Waitlist)
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Когда все основные места на матч заняты, статус игры меняется на <strong>Full (Мест нет)</strong>, а новые игроки автоматически попадают в очередь ожидания <strong>Waitlist</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    Принцип FIFO
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1">First-In, First-Out</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Игроки продвигаются строго по порядку записи. Тот, кто записался раньше, получает первое освободившееся место.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                    Автопродвижение
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1">Мгновенный перевод</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Как только участник из основного состава отменяет запись, участник с позицией #1 переводится в основной состав автоматически.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                    Оповещения
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1">In-App уведомления</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    При продвижении в основной состав игрок мгновенно получает push/in-app уведомление с подтверждением брони.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cancellation' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-amber-600">
                <Clock className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">
                  Дедлайн отмены и правила выхода из игры
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Правило 3 часов (Cancellation Deadline)</span>
                </div>
                <p className="leading-relaxed">
                  Игрок может самостоятельно отменить участие в игре <strong>не позднее чем за 3 часа</strong> до установленного времени начала матча.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>До дедлайна (более 3 часов):</strong> бесплатная отмена без понижения рейтинга. Место сразу передается следующему участнику из очереди.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>После дедлайна (менее 3 часов):</strong> самостоятельная кнопка отмены блокируется в интерфейсе. Игрок обязан напрямую связаться с организатором. В случае неявки без уважительной причины фиксируется No-Show.
                  </span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">
                  Фиксация посещаемости и репутация
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                После окончания каждого матча организатор открывает панель отметки явки и проставляет один из трёх статусов для каждого заявленного участника:
              </p>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900 block">Attended (Присутствовал)</span>
                    <span className="text-[11px] text-emerald-700">Игрок прибыл вовремя, сыграл матч. Увеличивает процент надёжности.</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                    +1 игра
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-rose-900 block">NoShow (Не явился без предупреждения)</span>
                    <span className="text-[11px] text-rose-700">Срыв матча. Резко снижает процент посещаемости и доступ к играм с высоким порогом.</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px]">
                    Штраф к рейтингу
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Excused (Уважительная причина)</span>
                    <span className="text-[11px] text-slate-600">Предупредил организатора заранее, найдена замена или форс-мажор. Не штрафуется.</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-600 text-white font-bold text-[10px]">
                    Нейтрально
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ratings' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-amber-500">
                <Award className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">
                  Система рейтингов и взаимных отзывов
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Рейтинг формируется на основе оценок от 1 до 5 звёзд и текстовых отзывов участников завершённых матчей:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Оценка участников</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Игроки могут оценивать спортивное поведение, пунктуальность и командный дух партнеров по матчу.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Оценка организатора</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Качество площадки, наличие мячей и манишек, соответствие заявленному уровню игры.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fairplay' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-purple-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">
                  Fair Play, Чёрный список и Модерация
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Мы стремимся создать безопасную и комфортную атмосферу на каждой игре. Для поддержания порядка предусмотрены инструменты защиты:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                  <strong className="text-purple-950 block">Личный чёрный список (Blacklist):</strong>
                  <span className="text-purple-800 text-[11px]">
                    Организатор может заблокировать игрока у себя в профиле. Заблокированный пользователь больше не сможет записаться ни на одну игру этого организатора.
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <strong className="text-rose-950 block">Система жалоб и модерация:</strong>
                  <span className="text-rose-800 text-[11px]">
                    В деталях каждого матча доступна кнопка «Подать жалобу». Модераторы и администраторы рассматривают обращения, выносят предупреждения и при необходимости блокируют аккаунт нарушителя.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

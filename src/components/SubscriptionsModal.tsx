import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { SubscriptionPlan } from '../types/index.ts';
import {
  X,
  Check,
  Zap,
  Crown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface SubscriptionsModalProps {
  onClose: () => void;
  onPlanChanged?: () => void;
}

export const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({
  onClose,
  onPlanChanged,
}) => {
  const { currentUser, updateSubscription } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentUser.subscriptionPlanId) return;
    setUpdatingPlanId(planId);
    try {
      await updateSubscription(planId);
      const chosen = plans.find((p) => p.id === planId);
      setSuccessMessage(`Ваш тариф успешно изменён на «${chosen?.name}»!`);
      if (onPlanChanged) onPlanChanged();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setUpdatingPlanId(null);
    }
  };

  const getEntitlementName = (code: string) => {
    switch (code) {
      case 'CREATE_GAME':
        return 'Создание открытых и частных игр';
      case 'CREATE_RECURRING_GAME':
        return 'Шаблоны регулярных повторяющихся игр';
      case 'ADVANCED_SEARCH':
        return 'Расширенный поиск и интерактивная карта';
      case 'ADVANCED_STATISTICS':
        return 'Расширенная статистика посещаемости и рейтингов';
      default:
        return code;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4" />
            <span>Тарифная модель и права (Entitlements)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Тарифные планы GroupGame
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl">
            Выберите подходящий уровень доступа для участия, самостоятельной организации матчей или управления спортивным сообществом.
          </p>

          {successMessage && (
            <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentUser.subscriptionPlanId === plan.id;
              const isClub = plan.id === 'plan-club';
              const isOrganizer = plan.id === 'plan-organizer';

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 border transition-all flex flex-col justify-between relative ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md'
                      : isClub
                      ? 'border-purple-200 bg-gradient-to-b from-purple-50/50 to-white hover:border-purple-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                      Текущий тариф
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        {plan.id === 'plan-free' && 'Игрок'}
                        {plan.id === 'plan-organizer' && 'Организатор'}
                        {plan.id === 'plan-club' && 'Клуб'}
                      </span>
                      {isClub ? (
                        <Crown className="w-5 h-5 text-purple-600" />
                      ) : isOrganizer ? (
                        <Zap className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mt-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[36px]">
                      {plan.description}
                    </p>

                    <div className="my-5 flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-slate-900">
                        {plan.price === 0 ? '0 ₽' : `${plan.price.toLocaleString('ru-RU')} ₽`}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        / {plan.period === 'month' ? 'месяц' : 'год'}
                      </span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Включённые возможности:
                      </span>
                      <ul className="space-y-2.5 text-xs text-slate-700">
                        <li className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Запись на любые открытые игры</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>FIFO лист ожидания с автопродвижением</span>
                        </li>

                        {plan.entitlements.map((code) => (
                          <li key={code} className="flex items-start space-x-2 font-medium">
                            <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>{getEntitlementName(code)}</span>
                          </li>
                        ))}

                        {plan.gameCreationLimitPerMonth ? (
                          <li className="flex items-start space-x-2 text-slate-500 text-[11px]">
                            <span className="w-4 h-4 text-center font-bold text-slate-400 shrink-0">
                              ℹ
                            </span>
                            <span>Лимит: до {plan.gameCreationLimitPerMonth} игр в месяц</span>
                          </li>
                        ) : (
                          <li className="flex items-start space-x-2 font-semibold text-purple-700 text-xs">
                            <Sparkles className="w-4 h-4 shrink-0 text-purple-500 mt-0.5" />
                            <span>Неограниченное создание матчей</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrent || updatingPlanId === plan.id}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : isClub
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                      }`}
                    >
                      {isCurrent ? (
                        <span>Активный план</span>
                      ) : updatingPlanId === plan.id ? (
                        <span>Переключение...</span>
                      ) : (
                        <>
                          <span>Выбрать тариф</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>
                Согласно ТЗ, тарифная модель и права (Entitlements) полностью разграничивают создание игр, шаблоны регулярных матчей и аналитику.
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 font-bold text-xs rounded-xl text-slate-700"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

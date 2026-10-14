import React, { useState, useEffect } from 'react';
import { Game, Sport, Venue, City } from './types/index.ts';
import { useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { GameCard } from './components/GameCard.tsx';
import { GameDetailsModal } from './components/GameDetailsModal.tsx';
import { CreateGameModal } from './components/CreateGameModal.tsx';
import { EditGameModal } from './components/EditGameModal.tsx';
import { AttendanceModal } from './components/AttendanceModal.tsx';
import { RatingModal } from './components/RatingModal.tsx';
import { ComplaintModal } from './components/ComplaintModal.tsx';
import { AdminView } from './components/AdminView.tsx';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal.tsx';
import { TemplatesView } from './components/TemplatesView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { YandexMapView } from './components/YandexMapView.tsx';
import { SubscriptionsModal } from './components/SubscriptionsModal.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Map,
  LayoutGrid,
  Users,
  Clock,
  Award,
  Crown,
  BookOpen,
  Shield,
  Repeat,
  User as UserIcon,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, activeCityId, refreshNotifications, unreadCount } = useAuth();

  const [currentTab, setCurrentTab] = useState<
    'games' | 'my-games' | 'templates' | 'profile' | 'admin' | 'db'
  >('games');

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const [games, setGames] = useState<Game[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [selectedSportId, setSelectedSportId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // My Games sub-category filter
  const [myGamesFilter, setMyGamesFilter] = useState<'all' | 'main' | 'waitlist' | 'organizer' | 'completed'>('all');

  // Modals state
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Game | null>(null);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<Game | null>(null);
  const [attendanceGame, setAttendanceGame] = useState<Game | null>(null);
  const [ratingGame, setRatingGame] = useState<Game | null>(null);
  const [complaintGame, setComplaintGame] = useState<{ game?: Game; targetUserId?: string } | null>(null);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCatalogs = async () => {
    try {
      const [resSports, resVenues, resCities] = await Promise.all([
        fetch('/api/sports'),
        fetch(`/api/venues?cityId=${activeCityId}`),
        fetch('/api/cities'),
      ]);
      if (resSports.ok) setSports(await resSports.json());
      if (resVenues.ok) setVenues(await resVenues.json());
      if (resCities.ok) setCities(await resCities.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSportId) params.append('sportId', selectedSportId);
      if (selectedLevelId) params.append('levelId', selectedLevelId);
      if (freeOnly) params.append('freeOnly', 'true');
      if (availableOnly) params.append('availableOnly', 'true');
      if (searchQuery) params.append('searchQuery', searchQuery);

      const res = await fetch(`/api/games?${params.toString()}`);
      if (res.ok) {
        const data: Game[] = await res.json();
        setGames(data);

        // Also update selected game if modal is open
        if (selectedGameForDetails) {
          const updated = data.find((g) => g.id === selectedGameForDetails.id);
          if (updated) setSelectedGameForDetails(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, [activeCityId]);

  useEffect(() => {
    fetchGames();
  }, [selectedSportId, selectedLevelId, freeOnly, availableOnly, searchQuery]);

  // Join action
  const handleJoinGame = async (gameId: string) => {
    try {
      const res = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка записи на игру');
      }

      if (data.participant.status === 'Main') {
        showToast('Вы успешно записаны в основной состав!');
      } else {
        showToast(`Вы добавлены в очередь ожидания: позиция #${data.participant.queuePosition}`);
      }

      fetchGames();
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // Leave action
  const handleLeaveGame = async (gameId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/games/${gameId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка отмены записи');
      }

      if (data.promotedUser) {
        showToast(
          `Запись отменена. Игрок ${data.promotedUser.firstName} ${data.promotedUser.lastName} автоматически продвинут из Waitlist в основной состав!`
        );
      } else {
        showToast('Запись успешно отменена.');
      }

      fetchGames();
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // Cancel game action
  const handleCancelGame = async (gameId: string, reason: string) => {
    try {
      const res = await fetch(`/api/games/${gameId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка отмены игры');
      }

      showToast('Игра отменена. Все участники получили уведомления.');
      fetchGames();
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // Filter for "My Games" subcategories
  const myGamesAll = games.filter(
    (g) =>
      g.organizerId === currentUser.id ||
      g.participants.some(
        (p) =>
          p.userId === currentUser.id && (p.status === 'Main' || p.status === 'Waitlist')
      )
  );

  const myGamesMain = games.filter((g) =>
    g.participants.some((p) => p.userId === currentUser.id && p.status === 'Main')
  );

  const myGamesWaitlist = games.filter((g) =>
    g.participants.some((p) => p.userId === currentUser.id && p.status === 'Waitlist')
  );

  const myGamesOrganized = games.filter((g) => g.organizerId === currentUser.id);

  const myGamesCompleted = games.filter(
    (g) =>
      g.status === 'Completed' &&
      (g.organizerId === currentUser.id ||
        g.participants.some((p) => p.userId === currentUser.id && p.status === 'Main'))
  );

  let displayedGames = games;
  if (currentTab === 'my-games') {
    if (myGamesFilter === 'main') displayedGames = myGamesMain;
    else if (myGamesFilter === 'waitlist') displayedGames = myGamesWaitlist;
    else if (myGamesFilter === 'organizer') displayedGames = myGamesOrganized;
    else if (myGamesFilter === 'completed') displayedGames = myGamesCompleted;
    else displayedGames = myGamesAll;
  }

  const isAdmin = currentUser.roles.includes('Administrator') || currentUser.roles.includes('Moderator');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 md:pb-0">
      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateGame={() => setShowCreateGame(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenSubscriptions={() => setShowSubscriptionsModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
      />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB: GAMES CATALOG & MY GAMES */}
        {(currentTab === 'games' || currentTab === 'my-games') && (
          <div className="space-y-6">
            {/* Filter Bar (available on main catalog) */}
            {currentTab === 'games' && (
              <FilterBar
                sports={sports}
                selectedSportId={selectedSportId}
                setSelectedSportId={setSelectedSportId}
                selectedLevelId={selectedLevelId}
                setSelectedLevelId={setSelectedLevelId}
                freeOnly={freeOnly}
                setFreeOnly={setFreeOnly}
                availableOnly={availableOnly}
                setAvailableOnly={setAvailableOnly}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {/* Sub-Tabs for "My Games" */}
            {currentTab === 'my-games' && (
              <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setMyGamesFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    myGamesFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>Все мои</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${myGamesFilter === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {myGamesAll.length}
                  </span>
                </button>

                <button
                  onClick={() => setMyGamesFilter('main')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    myGamesFilter === 'main'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>Основной состав</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${myGamesFilter === 'main' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {myGamesMain.length}
                  </span>
                </button>

                <button
                  onClick={() => setMyGamesFilter('waitlist')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    myGamesFilter === 'waitlist'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>В очереди (Waitlist)</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${myGamesFilter === 'waitlist' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {myGamesWaitlist.length}
                  </span>
                </button>

                <button
                  onClick={() => setMyGamesFilter('organizer')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    myGamesFilter === 'organizer'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>Я организатор</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${myGamesFilter === 'organizer' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {myGamesOrganized.length}
                  </span>
                </button>

                <button
                  onClick={() => setMyGamesFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    myGamesFilter === 'completed'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>Завершённые</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${myGamesFilter === 'completed' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {myGamesCompleted.length}
                  </span>
                </button>
              </div>
            )}

            {/* Title, Counter and View Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {currentTab === 'my-games' ? 'Мои матчи и очереди' : 'Спортивные игры и сборы'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {displayedGames.length} матчей найдено
                  {currentTab === 'my-games' && ' (где вы участник, в очереди или организатор)'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* View Switcher: Grid vs Map */}
                <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl p-1 shadow-xs">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Карточки</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      viewMode === 'map'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white text-rose-600 text-[9px] font-black flex items-center justify-center">
                      Я
                    </span>
                    <span>Яндекс Карты</span>
                  </button>
                </div>

                <button
                  onClick={fetchGames}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Обновить список"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Display: Map vs Grid */}
            {viewMode === 'map' ? (
              <YandexMapView
                games={displayedGames}
                activeCityId={activeCityId}
                onOpenDetails={(g) => setSelectedGameForDetails(g)}
                onQuickJoin={handleJoinGame}
              />
            ) : displayedGames.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
                <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-700 text-sm">Игр не найдено</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {currentTab === 'my-games'
                    ? 'По выбранной категории игр не найдено. Запишитесь на матч в каталоге или создайте свою игру!'
                    : 'По выбранным фильтрам нет подходящих игр. Попробуйте сбросить фильтры или создать игру.'}
                </p>
                {currentTab === 'my-games' && (
                  <button
                    onClick={() => setCurrentTab('games')}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-all"
                  >
                    Перейти в каталог игр
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onOpenDetails={(g) => setSelectedGameForDetails(g)}
                    onQuickJoin={handleJoinGame}
                    onQuickLeave={handleLeaveGame}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: RECURRING TEMPLATES */}
        {currentTab === 'templates' && (
          <TemplatesView sports={sports} venues={venues} onGameCreated={fetchGames} />
        )}

        {/* TAB: PROFILE & BLACKLIST */}
        {currentTab === 'profile' && (
          <ProfileView
            sports={sports}
            onOpenSubscriptions={() => setShowSubscriptionsModal(true)}
          />
        )}

        {/* TAB: ADMIN PANEL */}
        {currentTab === 'admin' && <AdminView />}

        {/* TAB: POSTGRESQL ARCHITECTURE */}
        {currentTab === 'db' && <DatabaseSchemaModal />}
      </main>

      {/* Footer Info & Quick Links */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">GroupGame Platform</span>
            <span>•</span>
            <span>Кроссплатформенная спортивная система (C# .NET 9 + React 18 + PostgreSQL)</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowRulesModal(true)}
              className="hover:text-blue-600 font-medium transition-colors"
            >
              Правила и Fair Play
            </button>
            <button
              onClick={() => setShowSubscriptionsModal(true)}
              className="hover:text-purple-600 font-medium transition-colors"
            >
              Тарифы и подписка
            </button>
            <button
              onClick={() => setCurrentTab('db')}
              className="hover:text-emerald-600 font-medium transition-colors"
            >
              PostgreSQL DDL
            </button>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('games')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
            currentTab === 'games' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Игры</span>
        </button>

        <button
          onClick={() => setCurrentTab('my-games')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
            currentTab === 'my-games' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Мои</span>
        </button>

        <button
          onClick={() => setShowCreateGame(true)}
          className="flex flex-col items-center py-1 px-2 text-[10px] font-bold text-white bg-blue-600 rounded-2xl shadow-md -mt-4 p-2.5"
        >
          <PlusCircle className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentTab('templates')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
            currentTab === 'templates' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Repeat className="w-5 h-5 mb-0.5" />
          <span>Шаблоны</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
            currentTab === 'profile' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span>Профиль</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold ${
              currentTab === 'admin' ? 'text-purple-600' : 'text-slate-500'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span>Админ</span>
          </button>
        )}
      </div>

      {/* MODALS */}
      {selectedGameForDetails && (
        <GameDetailsModal
          game={selectedGameForDetails}
          onClose={() => setSelectedGameForDetails(null)}
          onJoin={(id) => handleJoinGame(id)}
          onLeave={(id, reason) => handleLeaveGame(id, reason)}
          onCancelGame={(id, reason) => handleCancelGame(id, reason)}
          onOpenAttendance={(g) => setAttendanceGame(g)}
          onOpenRating={(g) => setRatingGame(g)}
          onOpenComplaint={(g, targetUserId) => setComplaintGame({ game: g, targetUserId })}
          onOpenEdit={(g) => {
            setSelectedGameForDetails(null);
            setGameToEdit(g);
          }}
        />
      )}

      {showCreateGame && (
        <CreateGameModal
          sports={sports}
          venues={venues}
          onClose={() => setShowCreateGame(false)}
          onCreated={() => {
            fetchGames();
            showToast('Игра успешно опубликована в каталоге!');
          }}
        />
      )}

      {gameToEdit && (
        <EditGameModal
          game={gameToEdit}
          venues={venues}
          onClose={() => setGameToEdit(null)}
          onUpdated={() => {
            fetchGames();
            showToast('Параметры игры успешно обновлены!');
          }}
        />
      )}

      {attendanceGame && (
        <AttendanceModal
          game={attendanceGame}
          onClose={() => setAttendanceGame(null)}
          onSaved={() => {
            fetchGames();
            showToast('Посещаемость успешно зафиксирована.');
          }}
        />
      )}

      {ratingGame && (
        <RatingModal
          game={ratingGame}
          onClose={() => setRatingGame(null)}
          onRated={() => {
            fetchGames();
            showToast('Спасибо за отзыв! Рейтинг игрока обновлён.');
          }}
        />
      )}

      {complaintGame && (
        <ComplaintModal
          game={complaintGame.game}
          targetUserId={complaintGame.targetUserId}
          onClose={() => setComplaintGame(null)}
          onSubmitted={() => {
            showToast('Жалоба отправлена на рассмотрение модераторам.');
          }}
        />
      )}

      {showSubscriptionsModal && (
        <SubscriptionsModal
          onClose={() => setShowSubscriptionsModal(false)}
          onPlanChanged={() => {
            showToast('Тарифный план обновлен.');
          }}
        />
      )}

      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {showAuthModal && (
        <AuthModal
          cities={cities}
          sports={sports}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

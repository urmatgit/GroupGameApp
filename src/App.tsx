import React, { useState, useEffect } from 'react';
import { Game, Sport, Venue } from './types/index.ts';
import { useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { GameCard } from './components/GameCard.tsx';
import { GameDetailsModal } from './components/GameDetailsModal.tsx';
import { CreateGameModal } from './components/CreateGameModal.tsx';
import { AttendanceModal } from './components/AttendanceModal.tsx';
import { RatingModal } from './components/RatingModal.tsx';
import { ComplaintModal } from './components/ComplaintModal.tsx';
import { AdminView } from './components/AdminView.tsx';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal.tsx';
import { TemplatesView } from './components/TemplatesView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { YandexMapView } from './components/YandexMapView.tsx';
import { Sparkles, Calendar, CheckCircle2, AlertCircle, RefreshCw, Map, LayoutGrid } from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, activeCityId, refreshNotifications } = useAuth();

  const [currentTab, setCurrentTab] = useState<
    'games' | 'my-games' | 'templates' | 'profile' | 'admin' | 'db'
  >('games');

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const [games, setGames] = useState<Game[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [selectedSportId, setSelectedSportId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Game | null>(null);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [attendanceGame, setAttendanceGame] = useState<Game | null>(null);
  const [ratingGame, setRatingGame] = useState<Game | null>(null);
  const [complaintGame, setComplaintGame] = useState<{ game?: Game; targetUserId?: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCatalogs = async () => {
    try {
      const [resSports, resVenues] = await Promise.all([
        fetch('/api/sports'),
        fetch(`/api/venues?cityId=${activeCityId}`),
      ]);
      if (resSports.ok) setSports(await resSports.ok ? await resSports.json() : []);
      if (resVenues.ok) setVenues(await resVenues.ok ? await resVenues.json() : []);
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

  // Filter for "My Games" tab
  const displayedGames =
    currentTab === 'my-games'
      ? games.filter((g) =>
          g.participants.some(
            (p) =>
              p.userId === currentUser.id && (p.status === 'Main' || p.status === 'Waitlist')
          )
        )
      : games;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateGame={() => setShowCreateGame(true)}
      />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB: GAMES CATALOG & MY GAMES */}
        {(currentTab === 'games' || currentTab === 'my-games') && (
          <div className="space-y-6">
            {/* Filter Bar */}
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

            {/* Title, Counter and View Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {currentTab === 'my-games' ? 'Мои матчи и очереди' : 'Спортивные игры и сборы'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {displayedGames.length} матчей найдено
                  {currentTab === 'my-games' && ' (где вы участник или в очереди)'}
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
                    ? 'Вы пока не записаны ни на один матч. Перейдите в каталог игр и запишитесь!'
                    : 'По выбранным фильтрам нет подходящих игр. Попробуйте сбросить фильтры или создать игру.'}
                </p>
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
        {currentTab === 'profile' && <ProfileView sports={sports} />}

        {/* TAB: ADMIN PANEL */}
        {currentTab === 'admin' && <AdminView />}

        {/* TAB: POSTGRESQL ARCHITECTURE */}
        {currentTab === 'db' && <DatabaseSchemaModal />}
      </main>

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
    </div>
  );
};

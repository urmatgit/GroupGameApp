import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../types/index.ts';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

declare global {
  interface Window {
    ymaps?: any;
    __ymapsPromise?: Promise<any>;
  }
}

interface YandexMapViewProps {
  games: Game[];
  activeCityId: string;
  onOpenDetails: (game: Game) => void;
  onQuickJoin: (gameId: string) => void;
}

// Helper to dynamically load Yandex Maps API v2.1 script once
const loadYandexMaps = (): Promise<any> => {
  if (typeof window === 'undefined') return Promise.reject();
  if (window.ymaps) {
    return new Promise((resolve) => window.ymaps.ready(() => resolve(window.ymaps)));
  }
  if (window.__ymapsPromise) {
    return window.__ymapsPromise;
  }

  window.__ymapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => resolve(window.ymaps));
      } else {
        reject(new Error('Yandex Maps API load failed'));
      }
    };
    script.onerror = () => reject(new Error('Не удалось загрузить скрипт Яндекс Карт'));
    document.head.appendChild(script);
  });

  return window.__ymapsPromise;
};

export const YandexMapView: React.FC<YandexMapViewProps> = ({
  games,
  activeCityId,
  onOpenDetails,
  onQuickJoin,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const cityCenters: Record<string, [number, number]> = {
    'city-1': [55.7558, 37.6173], // Москва
    'city-2': [59.9343, 30.3351], // Санкт-Петербург
  };

  const getPresetForSport = (sportName: string) => {
    if (sportName.includes('Волейбол')) return 'islands#blueSportIcon';
    if (sportName.includes('Баскетбол')) return 'islands#orangeSportIcon';
    if (sportName.includes('Футбол') || sportName.includes('Футзал')) return 'islands#greenSportIcon';
    if (sportName.includes('Теннис')) return 'islands#yellowSportIcon';
    return 'islands#darkBlueSportIcon';
  };

  // Initialize Yandex Map
  useEffect(() => {
    let isMounted = true;

    loadYandexMaps()
      .then((ymaps) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const center = cityCenters[activeCityId] || [55.7558, 37.6173];
          const map = new ymaps.Map(mapContainerRef.current, {
            center,
            zoom: 11,
            controls: ['zoomControl', 'fullscreenControl', 'typeSelector', 'geolocationControl'],
          });

          // Add search control
          const searchControl = new ymaps.control.SearchControl({
            options: {
              provider: 'yandex#search',
              noPopup: true,
            },
          });
          map.controls.add(searchControl);

          mapInstanceRef.current = map;
          setMapLoaded(true);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Yandex Maps load warning:', err);
          setLoadError('Яндекс Карты подгружаются или ограничены в окружении.');
        }
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center update on city change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const center = cityCenters[activeCityId] || [55.7558, 37.6173];
    mapInstanceRef.current.setCenter(center, 11, { duration: 500 });
  }, [activeCityId]);

  // Update placemarks on games update
  useEffect(() => {
    if (!mapInstanceRef.current || !window.ymaps) return;
    const ymaps = window.ymaps;
    const map = mapInstanceRef.current;

    map.geoObjects.removeAll();

    const gamesWithCoords = games.filter((g) => g.latitude && g.longitude);
    if (gamesWithCoords.length === 0) return;

    const geoObjects: any[] = [];

    gamesWithCoords.forEach((game) => {
      if (!game.latitude || !game.longitude) return;

      const pos = [game.latitude, game.longitude];
      const preset = getPresetForSport(game.sportName);
      const isFull = game.mainCount >= game.maxPlayers;
      const spotsLeft = Math.max(0, game.maxPlayers - game.mainCount);

      const placemark = new ymaps.Placemark(
        pos,
        {
          hintContent: `<strong>${game.title}</strong><br/>${game.venueName}<br/>Свободно: ${spotsLeft} мест`,
          balloonContentHeader: `<div style="font-weight:bold; font-size:14px; color:#1e293b;">${game.title}</div>`,
          balloonContentBody: `
            <div style="font-size:12px; color:#475569; padding-top:4px;">
              <div style="margin-bottom:4px;"><strong>Спорт:</strong> ${game.sportName} (${game.levelName})</div>
              <div style="margin-bottom:4px;"><strong>Площадка:</strong> ${game.venueName}</div>
              <div style="margin-bottom:4px;"><strong>Адрес:</strong> ${game.venueAddress}</div>
              <div style="margin-bottom:4px;"><strong>Состав:</strong> ${game.mainCount}/${game.maxPlayers} ${game.waitlistCount > 0 ? `(+${game.waitlistCount} в очереди)` : ''}</div>
              <div><strong>Цена:</strong> ${game.price === 0 ? 'Бесплатно' : `${game.price} ₽`}</div>
            </div>
          `,
          balloonContentFooter: `
            <div style="padding-top:6px; font-size:11px; color:#2563eb; font-weight:bold;">
              Кликните для выбора матча в боковой панели
            </div>
          `,
        },
        {
          preset,
          hasBalloon: true,
          hideIconOnBalloonOpen: false,
        }
      );

      placemark.events.add('click', () => {
        setSelectedGame(game);
        map.panTo(pos, { flying: true, duration: 600 });
      });

      geoObjects.push(placemark);
      map.geoObjects.add(placemark);
    });

    if (geoObjects.length > 0) {
      map.setBounds(map.geoObjects.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 40,
      });
    }
  }, [games, mapLoaded]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col lg:flex-row h-[640px] relative">
      {/* Map Canvas */}
      <div className="flex-1 h-full min-h-[360px] relative bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Yandex Brand & Legend Badge */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 shadow-md text-xs font-semibold text-slate-800 flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              Я
            </span>
            <span className="font-bold text-slate-900">Яндекс Карты</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1.5 text-slate-600 text-[11px]">
            <span>🏐 Волейбол</span>
            <span>🏀 Баскетбол</span>
            <span>⚽ Футзал</span>
            <span>🎾 Теннис</span>
          </div>
        </div>

        {/* Loading overlay if initializing */}
        {!mapLoaded && !loadError && (
          <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-xs flex items-center justify-center space-x-2 text-slate-600 text-xs font-semibold">
            <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Загрузка Яндекс Карт...</span>
          </div>
        )}
      </div>

      {/* Side Details Drawer */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 bg-slate-50/50 flex flex-col justify-between overflow-y-auto">
        {selectedGame ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800">
                  {selectedGame.sportName}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {selectedGame.price === 0 ? 'Бесплатно' : `${selectedGame.price} ₽`}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-2 leading-snug">
                {selectedGame.title}
              </h3>
              <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                {selectedGame.levelName}
              </span>
            </div>

            {/* Time & Venue */}
            <div className="space-y-2 text-xs text-slate-700 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span className="font-semibold">
                  {new Date(selectedGame.startDateTime).toLocaleDateString('ru-RU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                <Clock className="w-4 h-4 text-rose-600 ml-2 flex-shrink-0" />
                <span>
                  {new Date(selectedGame.startDateTime).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-start space-x-2 pt-1.5 border-t border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">{selectedGame.venueName}</strong>
                  <span className="text-[11px] text-slate-500">{selectedGame.venueAddress}</span>
                </div>
              </div>

              {selectedGame.latitude && selectedGame.longitude && (
                <div className="pt-1">
                  <a
                    href={`https://yandex.ru/maps/?pt=${selectedGame.longitude},${selectedGame.latitude}&z=16&l=map`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
                  >
                    <span>Открыть маршрут в Яндекс Картах</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Capacity meter */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Состав игроков</span>
                </div>
                <span className="text-slate-900 font-bold">
                  {selectedGame.mainCount} / {selectedGame.maxPlayers}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedGame.mainCount >= selectedGame.maxPlayers
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedGame.mainCount / selectedGame.maxPlayers) * 100
                    )}%`,
                  }}
                />
              </div>

              {selectedGame.waitlistCount > 0 && (
                <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                  {selectedGame.waitlistCount} чел. в резервной очереди Waitlist
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onOpenDetails(selectedGame)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Подробная карточка</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {selectedGame.status !== 'Completed' && selectedGame.status !== 'Cancelled' && (
                <button
                  onClick={() => onQuickJoin(selectedGame.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors ${
                    selectedGame.mainCount >= selectedGame.maxPlayers
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedGame.mainCount >= selectedGame.maxPlayers
                    ? 'Встать в очередь (Waitlist)'
                    : 'Быстрая запись'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl ring-4 ring-rose-100/50">
              Я
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Площадки на Яндекс Картах</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Кликните на метку спортивного комплекса на Яндекс Картах, чтобы посмотреть адрес, состав и
              записаться на матч.
            </p>
          </div>
        )}

        {/* Venue list below */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Доступные залы ({games.filter((g) => g.latitude).length}):
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {games
              .filter((g) => g.latitude && g.longitude)
              .map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGame(g);
                    if (mapInstanceRef.current && g.latitude && g.longitude) {
                      mapInstanceRef.current.panTo([g.latitude, g.longitude], {
                        flying: true,
                        duration: 600,
                      });
                    }
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                    selectedGame?.id === g.id
                      ? 'bg-rose-50 text-rose-900 font-bold border border-rose-200'
                      : 'bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate pr-2">{g.title}</span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {g.mainCount}/{g.maxPlayers}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

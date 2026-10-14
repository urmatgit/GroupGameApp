import React from 'react';
import { Sport } from '../types/index.ts';
import { Search, SlidersHorizontal, CheckCircle2, DollarSign } from 'lucide-react';

interface FilterBarProps {
  sports: Sport[];
  selectedSportId: string;
  setSelectedSportId: (id: string) => void;
  selectedLevelId: string;
  setSelectedLevelId: (id: string) => void;
  freeOnly: boolean;
  setFreeOnly: (val: boolean) => void;
  availableOnly: boolean;
  setAvailableOnly: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  sports,
  selectedSportId,
  setSelectedSportId,
  selectedLevelId,
  setSelectedLevelId,
  freeOnly,
  setFreeOnly,
  availableOnly,
  setAvailableOnly,
  searchQuery,
  setSearchQuery,
}) => {
  const currentSport = sports.find((s) => s.id === selectedSportId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
      {/* Top Search & Toggle Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию игры, залу или адресу..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Free Only Toggle */}
          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              freeOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Бесплатные</span>
          </button>

          {/* Available Spots Only Toggle */}
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              availableOnly
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Свободные места</span>
          </button>
        </div>
      </div>

      {/* Sport Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            setSelectedSportId('');
            setSelectedLevelId('');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedSportId === ''
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Все виды спорта
        </button>

        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => {
              setSelectedSportId(sport.id);
              setSelectedLevelId('');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              selectedSportId === sport.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span>{sport.name}</span>
          </button>
        ))}
      </div>

      {/* Sport Levels Row (if a sport is selected) */}
      {currentSport && currentSport.levels.length > 0 && (
        <div className="flex items-center space-x-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Уровень:</span>
          <button
            onClick={() => setSelectedLevelId('')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              selectedLevelId === ''
                ? 'bg-blue-100 text-blue-800 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Все уровни
          </button>
          {currentSport.levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevelId(lvl.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedLevelId === lvl.id
                  ? 'bg-blue-100 text-blue-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lvl.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

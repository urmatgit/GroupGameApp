import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../components/FilterBar.tsx';
import { mockSports } from './mockTestData.ts';

describe('FilterBar Component', () => {
  it('renders all sport filters and toggles', () => {
    const setSelectedSportId = vi.fn();
    const setSelectedLevelId = vi.fn();
    const setFreeOnly = vi.fn();
    const setAvailableOnly = vi.fn();
    const setSearchQuery = vi.fn();

    render(
      <FilterBar
        sports={mockSports}
        selectedSportId=""
        setSelectedSportId={setSelectedSportId}
        selectedLevelId=""
        setSelectedLevelId={setSelectedLevelId}
        freeOnly={false}
        setFreeOnly={setFreeOnly}
        availableOnly={false}
        setAvailableOnly={setAvailableOnly}
        searchQuery=""
        setSearchQuery={setSearchQuery}
      />
    );

    expect(screen.getByText('Все виды спорта')).toBeInTheDocument();
    expect(screen.getByText(/Волейбол/)).toBeInTheDocument();
    expect(screen.getByText(/Мини-футбол/)).toBeInTheDocument();
    expect(screen.getByText('Бесплатные')).toBeInTheDocument();
    expect(screen.getByText('Свободные места')).toBeInTheDocument();
  });

  it('triggers setSelectedSportId when clicking a sport button', () => {
    const setSelectedSportId = vi.fn();
    const setSelectedLevelId = vi.fn();
    const setFreeOnly = vi.fn();
    const setAvailableOnly = vi.fn();
    const setSearchQuery = vi.fn();

    render(
      <FilterBar
        sports={mockSports}
        selectedSportId=""
        setSelectedSportId={setSelectedSportId}
        selectedLevelId=""
        setSelectedLevelId={setSelectedLevelId}
        freeOnly={false}
        setFreeOnly={setFreeOnly}
        availableOnly={false}
        setAvailableOnly={setAvailableOnly}
        searchQuery=""
        setSearchQuery={setSearchQuery}
      />
    );

    const volleyballBtn = screen.getByText(/Волейбол/);
    fireEvent.click(volleyballBtn);

    expect(setSelectedSportId).toHaveBeenCalledWith('sport-volleyball');
    expect(setSelectedLevelId).toHaveBeenCalledWith('');
  });

  it('triggers search query on text input', () => {
    const setSelectedSportId = vi.fn();
    const setSelectedLevelId = vi.fn();
    const setFreeOnly = vi.fn();
    const setAvailableOnly = vi.fn();
    const setSearchQuery = vi.fn();

    render(
      <FilterBar
        sports={mockSports}
        selectedSportId=""
        setSelectedSportId={setSelectedSportId}
        selectedLevelId=""
        setSelectedLevelId={setSelectedLevelId}
        freeOnly={false}
        setFreeOnly={setFreeOnly}
        availableOnly={false}
        setAvailableOnly={setAvailableOnly}
        searchQuery=""
        setSearchQuery={setSearchQuery}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Поиск по названию/);
    fireEvent.change(searchInput, { target: { value: 'Динамо' } });

    expect(setSearchQuery).toHaveBeenCalledWith('Динамо');
  });
});

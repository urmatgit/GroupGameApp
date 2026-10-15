import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameCard } from '../components/GameCard.tsx';
import { mockOpenGame, mockFullGame, mockUser, mockOrganizer } from './mockTestData.ts';
import * as AuthContextModule from '../context/AuthContext.tsx';

describe('GameCard Component', () => {
  it('renders game title, sport and level correctly', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockUser,
      allUsers: [mockUser, mockOrganizer],
      switchUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      updateSubscription: vi.fn(),
      updateProfile: vi.fn(),
      notifications: [],
      unreadCount: 0,
      markNotificationRead: vi.fn(),
      markAllNotificationsRead: vi.fn(),
      refreshNotifications: vi.fn(),
      refreshUser: vi.fn(),
      activeCityId: 'city-1',
      setActiveCityId: vi.fn(),
    });

    const onOpenDetails = vi.fn();
    const onQuickJoin = vi.fn();
    const onQuickLeave = vi.fn();

    render(
      <GameCard
        game={mockOpenGame}
        onOpenDetails={onOpenDetails}
        onQuickJoin={onQuickJoin}
        onQuickLeave={onQuickLeave}
      />
    );

    expect(screen.getByText('Волейбол 6х6 (Уверенные любители)')).toBeInTheDocument();
    expect(screen.getByText('Волейбол')).toBeInTheDocument();
    expect(screen.getByText('Любитель')).toBeInTheDocument();
    expect(screen.getByText('Набор открыт')).toBeInTheDocument();
    expect(screen.getByText(/600 ₽/)).toBeInTheDocument();
  });

  it('shows Waitlist status when game is full and user is in queue', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockUser,
      allUsers: [mockUser, mockOrganizer],
      switchUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      updateSubscription: vi.fn(),
      updateProfile: vi.fn(),
      notifications: [],
      unreadCount: 0,
      markNotificationRead: vi.fn(),
      markAllNotificationsRead: vi.fn(),
      refreshNotifications: vi.fn(),
      refreshUser: vi.fn(),
      activeCityId: 'city-1',
      setActiveCityId: vi.fn(),
    });

    const onOpenDetails = vi.fn();
    const onQuickJoin = vi.fn();
    const onQuickLeave = vi.fn();

    render(
      <GameCard
        game={mockFullGame}
        onOpenDetails={onOpenDetails}
        onQuickJoin={onQuickJoin}
        onQuickLeave={onQuickLeave}
      />
    );

    expect(screen.getByText('Очередь (Full)')).toBeInTheDocument();
    expect(screen.getByText(/Очередь #1/)).toBeInTheDocument();
  });

  it('triggers onQuickJoin when clicking join button', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockUser,
      allUsers: [mockUser, mockOrganizer],
      switchUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      updateSubscription: vi.fn(),
      updateProfile: vi.fn(),
      notifications: [],
      unreadCount: 0,
      markNotificationRead: vi.fn(),
      markAllNotificationsRead: vi.fn(),
      refreshNotifications: vi.fn(),
      refreshUser: vi.fn(),
      activeCityId: 'city-1',
      setActiveCityId: vi.fn(),
    });

    const onOpenDetails = vi.fn();
    const onQuickJoin = vi.fn();
    const onQuickLeave = vi.fn();

    render(
      <GameCard
        game={mockOpenGame}
        onOpenDetails={onOpenDetails}
        onQuickJoin={onQuickJoin}
        onQuickLeave={onQuickLeave}
      />
    );

    const joinBtn = screen.getByText('Записаться');
    fireEvent.click(joinBtn);

    expect(onQuickJoin).toHaveBeenCalledWith(mockOpenGame.id);
  });
});

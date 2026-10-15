import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../components/Header';
import * as AuthContextModule from '../context/AuthContext.tsx';
import { User, NotificationItem } from '../types';

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  firstName: 'Иван',
  lastName: 'Иванов',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  phone: '+7 (999) 000-00-00',
  cityId: 'c1',
  userRole: 'User',
  status: 'Active',
  createdAt: new Date().toISOString(),
};

const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'WAITLIST_PROMOTED',
    title: 'Продвижение из очереди!',
    message: 'Вы переведены из очереди в основной состав на матч.',
    isRead: false,
    createdAt: new Date().toISOString(),
    gameId: 'g1',
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'WAITLIST_ADVANCED',
    title: 'Продвижение в очереди!',
    message: 'Ваша позиция в очереди продвинулась: #1.',
    isRead: true,
    createdAt: new Date().toISOString(),
    gameId: 'g1',
  },
];

describe('Notification System in Header', () => {
  it('renders notification bell button with unread count badge', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockUser,
      allUsers: [mockUser],
      switchUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      updateSubscription: vi.fn(),
      updateProfile: vi.fn(),
      notifications: mockNotifications,
      unreadCount: 1,
      markNotificationRead: vi.fn(),
      markAllNotificationsRead: vi.fn(),
      refreshNotifications: vi.fn(),
      refreshUser: vi.fn(),
      activeCityId: 'c1',
      setActiveCityId: vi.fn(),
    });

    render(
      <Header
        currentTab="games"
        setCurrentTab={vi.fn()}
        onOpenCreateGame={vi.fn()}
      />
    );

    // Bell button should display unread badge "1"
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('opens notifications panel and displays list of notifications', () => {
    const markReadMock = vi.fn();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockUser,
      allUsers: [mockUser],
      switchUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      updateSubscription: vi.fn(),
      updateProfile: vi.fn(),
      notifications: mockNotifications,
      unreadCount: 1,
      markNotificationRead: markReadMock,
      markAllNotificationsRead: vi.fn(),
      refreshNotifications: vi.fn(),
      refreshUser: vi.fn(),
      activeCityId: 'c1',
      setActiveCityId: vi.fn(),
    });

    render(
      <Header
        currentTab="games"
        setCurrentTab={vi.fn()}
        onOpenCreateGame={vi.fn()}
      />
    );

    const bellBtn = screen.getByTitle('Уведомления');
    fireEvent.click(bellBtn);

    expect(screen.getByText('Продвижение из очереди!')).toBeInTheDocument();
    expect(screen.getByText('Продвижение в очереди!')).toBeInTheDocument();

    const notifItem = screen.getByText('Продвижение из очереди!');
    fireEvent.click(notifItem.closest('div')!);

    expect(markReadMock).toHaveBeenCalledWith('n1');
  });
});

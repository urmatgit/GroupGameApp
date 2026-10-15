import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from '../components/AuthModal.tsx';
import { mockUser, mockOrganizer, mockSports } from './mockTestData.ts';
import * as AuthContextModule from '../context/AuthContext.tsx';

describe('AuthModal Component', () => {
  it('renders login form by default and can switch to register and personas', () => {
    const switchUserMock = vi.fn();
    const loginMock = vi.fn();
    const registerMock = vi.fn();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockUser,
      allUsers: [mockUser, mockOrganizer],
      switchUser: switchUserMock,
      login: loginMock,
      register: registerMock,
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

    render(
      <AuthModal
        onClose={vi.fn()}
        cities={[{ id: 'city-1', name: 'Москва', country: 'Россия' }]}
        sports={mockSports}
      />
    );

    // Default tab is Login
    expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('alexey.organizer@yandex.ru')).toBeInTheDocument();

    // Switch to Register
    const regTabBtn = screen.getByRole('button', { name: /Регистрация/ });
    fireEvent.click(regTabBtn);

    expect(screen.getByText('Регистрация спортсмена')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Сергей')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Морозов')).toBeInTheDocument();

    // Switch to Personas
    const personasTabBtn = screen.getByRole('button', { name: /Персоны/ });
    fireEvent.click(personasTabBtn);

    expect(screen.getByText('Демо-персоны и роли')).toBeInTheDocument();
    expect(screen.getByText('Алексей Смирнов')).toBeInTheDocument();
    expect(screen.getByText('Дмитрий Иванов')).toBeInTheDocument();
  });
});

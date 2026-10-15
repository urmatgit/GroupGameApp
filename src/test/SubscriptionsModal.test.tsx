import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SubscriptionsModal } from '../components/SubscriptionsModal.tsx';
import { mockUser, mockOrganizer } from './mockTestData.ts';
import * as AuthContextModule from '../context/AuthContext.tsx';

describe('SubscriptionsModal Component', () => {
  beforeEach(() => {
    // Mock fetch for /api/plans
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/plans') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 'plan-free',
                name: 'Базовый (Бесплатный)',
                price: 0,
                period: 'month',
                description: 'Для игроков и любителей',
                entitlements: ['ADVANCED_SEARCH'],
                gameCreationLimitPerMonth: 2,
              },
              {
                id: 'plan-organizer',
                name: 'Организатор PRO',
                price: 490,
                period: 'month',
                description: 'Для регулярных организаторов',
                entitlements: ['CREATE_GAME', 'ADVANCED_SEARCH', 'ADVANCED_STATISTICS'],
              },
              {
                id: 'plan-club',
                name: 'Спортивный Клуб (Elite)',
                price: 1990,
                period: 'month',
                description: 'Для спортивных клубов и секций',
                entitlements: ['CREATE_GAME', 'CREATE_RECURRING_GAME', 'ADVANCED_SEARCH', 'ADVANCED_STATISTICS'],
              },
            ]),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });
  });

  it('renders all 3 subscription plans and highlights current plan', async () => {
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

    render(<SubscriptionsModal onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Базовый (Бесплатный)')).toBeInTheDocument();
      expect(screen.getByText('Организатор PRO')).toBeInTheDocument();
      expect(screen.getByText('Спортивный Клуб (Elite)')).toBeInTheDocument();
    });

    // Plan-free is user's current plan
    expect(screen.getByText('Текущий тариф')).toBeInTheDocument();
    expect(screen.getByText('0 ₽')).toBeInTheDocument();
    expect(screen.getByText('490 ₽')).toBeInTheDocument();
    expect(screen.getByText('1 990 ₽')).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditGameModal } from '../components/EditGameModal.tsx';
import { mockOpenGame, mockOrganizer, mockVenues } from './mockTestData.ts';
import * as AuthContextModule from '../context/AuthContext.tsx';

describe('EditGameModal Component', () => {
  it('renders pre-filled game values and submits update', async () => {
    const fetchMock = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockOpenGame, title: 'Обновленный волейбол' }),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });
    global.fetch = fetchMock;

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockOrganizer,
      allUsers: [mockOrganizer],
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

    const onUpdated = vi.fn();
    const onClose = vi.fn();

    render(
      <EditGameModal
        game={mockOpenGame}
        venues={mockVenues}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    expect(screen.getByText('Редактирование параметров игры')).toBeInTheDocument();
    const titleInput = screen.getByDisplayValue(mockOpenGame.title);
    expect(titleInput).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: 'Обновленный волейбол' } });

    const saveBtn = screen.getByText('Сохранить изменения');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onUpdated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});

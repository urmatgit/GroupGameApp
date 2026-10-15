import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RatingModal } from '../components/RatingModal.tsx';
import { mockFullGame, mockOrganizer, mockUser } from './mockTestData.ts';
import * as AuthContextModule from '../context/AuthContext.tsx';

describe('RatingModal Component', () => {
  it('renders participant evaluation form and submits rating', async () => {
    const fetchMock = vi.fn().mockImplementation((url, opts) => {
      if (url.includes('/ratings') && opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'rating-1' }),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });
    global.fetch = fetchMock;

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockOrganizer,
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

    const onRated = vi.fn();
    const onClose = vi.fn();

    render(
      <RatingModal
        game={mockFullGame}
        onClose={onClose}
        onRated={onRated}
      />
    );

    expect(screen.getByText('Оценка и отзыв')).toBeInTheDocument();
    expect(screen.getByText('Иван Петров')).toBeInTheDocument();

    // Select stars
    const stars = screen.getAllByRole('button').filter((b) => b.querySelector('svg'));
    if (stars.length > 0) {
      fireEvent.click(stars[4]); // 5th star
    }

    // Enter review text
    const textarea = screen.getByPlaceholderText(/Отличный приём мяча/);
    fireEvent.change(textarea, { target: { value: 'Отличная игра, прекрасный пас!' } });

    // Submit
    const submitBtn = screen.getByText('Отправить отзыв');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onRated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});

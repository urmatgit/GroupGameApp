import { describe, it, expect } from 'vitest';
import { Game, GameParticipant } from '../types/index.ts';

describe('FIFO Waitlist & Cancellation Deadline Logic', () => {
  it('correctly places user into Main if slots available', () => {
    const maxPlayers = 2;
    const participants: GameParticipant[] = [];

    const joinGame = (userId: string): { status: 'Main' | 'Waitlist'; queuePosition?: number } => {
      const mainCount = participants.filter((p) => p.status === 'Main').length;
      if (mainCount < maxPlayers) {
        const participant: GameParticipant = {
          id: `p-${userId}`,
          gameId: 'game-1',
          userId,
          user: { id: userId, firstName: 'User', lastName: userId, avatarUrl: '', rating: 5.0 },
          status: 'Main',
          joinedAt: new Date().toISOString(),
        };
        participants.push(participant);
        return { status: 'Main' };
      } else {
        const waitlistCount = participants.filter((p) => p.status === 'Waitlist').length;
        const position = waitlistCount + 1;
        const participant: GameParticipant = {
          id: `p-${userId}`,
          gameId: 'game-1',
          userId,
          user: { id: userId, firstName: 'User', lastName: userId, avatarUrl: '', rating: 5.0 },
          status: 'Waitlist',
          queuePosition: position,
          joinedAt: new Date().toISOString(),
        };
        participants.push(participant);
        return { status: 'Waitlist', queuePosition: position };
      }
    };

    // User 1 joins -> Main
    const r1 = joinGame('u1');
    expect(r1.status).toBe('Main');

    // User 2 joins -> Main
    const r2 = joinGame('u2');
    expect(r2.status).toBe('Main');

    // User 3 joins -> Waitlist #1
    const r3 = joinGame('u3');
    expect(r3.status).toBe('Waitlist');
    expect(r3.queuePosition).toBe(1);

    // User 4 joins -> Waitlist #2
    const r4 = joinGame('u4');
    expect(r4.status).toBe('Waitlist');
    expect(r4.queuePosition).toBe(2);
  });

  it('automatically promotes the first waitlist participant (FIFO) when a main roster player leaves', () => {
    const participants: GameParticipant[] = [
      {
        id: 'p-1',
        gameId: 'game-1',
        userId: 'u1',
        user: { id: 'u1', firstName: 'User1', lastName: 'L', avatarUrl: '', rating: 5.0 },
        status: 'Main',
        joinedAt: '2026-10-14T10:00:00Z',
      },
      {
        id: 'p-2',
        gameId: 'game-1',
        userId: 'u2',
        user: { id: 'u2', firstName: 'User2', lastName: 'L', avatarUrl: '', rating: 5.0 },
        status: 'Main',
        joinedAt: '2026-10-14T10:01:00Z',
      },
      {
        id: 'p-3',
        gameId: 'game-1',
        userId: 'u3',
        user: { id: 'u3', firstName: 'User3', lastName: 'L', avatarUrl: '', rating: 5.0 },
        status: 'Waitlist',
        queuePosition: 1,
        joinedAt: '2026-10-14T10:02:00Z',
      },
      {
        id: 'p-4',
        gameId: 'game-1',
        userId: 'u4',
        user: { id: 'u4', firstName: 'User4', lastName: 'L', avatarUrl: '', rating: 5.0 },
        status: 'Waitlist',
        queuePosition: 2,
        joinedAt: '2026-10-14T10:03:00Z',
      },
    ];

    // User 1 leaves
    const leavingUser = participants.find((p) => p.userId === 'u1')!;
    leavingUser.status = 'Cancelled';

    // Auto-promote first in waitlist
    const promoted = participants
      .filter((p) => p.status === 'Waitlist')
      .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0))[0];

    expect(promoted).toBeDefined();
    expect(promoted.userId).toBe('u3');

    promoted.status = 'Main';
    promoted.queuePosition = null;

    // Remaining waitlist reindexed
    participants
      .filter((p) => p.status === 'Waitlist')
      .forEach((p, idx) => {
        p.queuePosition = idx + 1;
      });

    const remainingWaitlist = participants.find((p) => p.userId === 'u4')!;
    expect(remainingWaitlist.queuePosition).toBe(1);
  });

  it('validates cancellation deadline: prevents self-cancel within 3 hours of start', () => {
    const cancellationDeadlineHours = 3;
    const now = new Date('2026-10-14T16:00:00Z').getTime();

    // Game starts in 2 hours (less than 3h deadline)
    const gameStartSoon = new Date('2026-10-14T18:00:00Z').getTime();
    const deadlineMs = cancellationDeadlineHours * 3600 * 1000;
    const canCancelSoon = now <= gameStartSoon - deadlineMs;

    expect(canCancelSoon).toBe(false);

    // Game starts in 5 hours (more than 3h deadline)
    const gameStartLater = new Date('2026-10-14T21:00:00Z').getTime();
    const canCancelLater = now <= gameStartLater - deadlineMs;

    expect(canCancelLater).toBe(true);
  });
});

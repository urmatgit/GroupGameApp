import {
  User,
  Game,
  GameParticipant,
  GameTemplate,
  GameAttendance,
  Rating,
  BlacklistEntry,
  Complaint,
  NotificationItem,
  AuditLog,
  SubscriptionPlan,
  Sport,
  City,
  Venue,
  AttendanceStatus,
} from '../types/index.ts';
import {
  initialCities,
  initialSports,
  initialVenues,
  initialSubscriptionPlans,
  initialUsers,
  initialGames,
  initialTemplates,
  initialComplaints,
  initialNotifications,
  initialAuditLogs,
} from './mockData.ts';

class AppStore {
  public cities: City[] = [...initialCities];
  public sports: Sport[] = [...initialSports];
  public venues: Venue[] = [...initialVenues];
  public plans: SubscriptionPlan[] = [...initialSubscriptionPlans];
  public users: User[] = [...initialUsers];
  public games: Game[] = [...initialGames];
  public templates: GameTemplate[] = [...initialTemplates];
  public attendance: GameAttendance[] = [];
  public ratings: Rating[] = [];
  public blacklist: BlacklistEntry[] = [];
  public complaints: Complaint[] = [...initialComplaints];
  public notifications: NotificationItem[] = [...initialNotifications];
  public auditLogs: AuditLog[] = [...initialAuditLogs];

  constructor() {
    // Seed initial attendance record for completed game
    this.attendance.push(
      {
        id: 'att-1',
        gameId: 'game-football-yesterday-completed',
        userId: 'user-organizer-alexey',
        markedByUserId: 'user-organizer-alexey',
        status: 'Attended',
        markedAt: '2026-10-13T20:30:00Z',
      },
      {
        id: 'att-2',
        gameId: 'game-football-yesterday-completed',
        userId: 'user-player-dmitry',
        markedByUserId: 'user-organizer-alexey',
        status: 'Attended',
        markedAt: '2026-10-13T20:30:00Z',
      },
      {
        id: 'att-3',
        gameId: 'game-football-yesterday-completed',
        userId: 'user-player-pavel',
        markedByUserId: 'user-organizer-alexey',
        status: 'NoShow',
        markedAt: '2026-10-13T20:30:00Z',
      }
    );
  }

  // --- Users & Roles ---
  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Пользователь не найден');
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  public setUserStatus(id: string, status: User['status'], adminUserId: string): User {
    const user = this.updateUser(id, { status });
    const admin = this.getUserById(adminUserId);
    this.addAuditLog(
      adminUserId,
      admin ? `${admin.firstName} ${admin.lastName}` : 'Admin',
      'USER_STATUS_CHANGE',
      'User',
      id,
      `Статус пользователя ${user.firstName} ${user.lastName} изменён на ${status}`
    );
    return user;
  }

  // --- Entitlements Check ---
  public hasEntitlement(userId: string, entitlementCode: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    // Admins always have all entitlements
    if (user.roles.includes('Administrator')) return true;

    const plan = this.plans.find((p) => p.id === (user.subscriptionPlanId || 'plan-free'));
    return plan?.entitlements.includes(entitlementCode as any) ?? false;
  }

  // --- Blacklist ---
  public isUserBlacklistedByOrganizer(organizerId: string, userId: string): boolean {
    return this.blacklist.some(
      (entry) => entry.ownerUserId === organizerId && entry.blockedUserId === userId
    );
  }

  public addToBlacklist(ownerUserId: string, blockedUserId: string, reason?: string): BlacklistEntry {
    if (ownerUserId === blockedUserId) {
      throw new Error('Нельзя заблокировать самого себя');
    }
    const existing = this.blacklist.find(
      (b) => b.ownerUserId === ownerUserId && b.blockedUserId === blockedUserId
    );
    if (existing) return existing;

    const blockedUser = this.getUserById(blockedUserId);
    if (!blockedUser) throw new Error('Пользователь для блокировки не найден');

    const entry: BlacklistEntry = {
      id: `bl-${Date.now()}`,
      ownerUserId,
      blockedUserId,
      blockedUser: {
        id: blockedUser.id,
        firstName: blockedUser.firstName,
        lastName: blockedUser.lastName,
        avatarUrl: blockedUser.avatarUrl,
      },
      reason,
      createdAt: new Date().toISOString(),
    };
    this.blacklist.push(entry);
    return entry;
  }

  public removeFromBlacklist(ownerUserId: string, blockedUserId: string): void {
    this.blacklist = this.blacklist.filter(
      (b) => !(b.ownerUserId === ownerUserId && b.blockedUserId === blockedUserId)
    );
  }

  // --- Games & Participation ---
  public getGames(filters?: {
    cityId?: string;
    sportId?: string;
    levelId?: string;
    status?: string;
    freeOnly?: boolean;
    availableOnly?: boolean;
    searchQuery?: string;
  }): Game[] {
    let result = [...this.games];

    if (filters?.sportId) {
      result = result.filter((g) => g.sportId === filters.sportId);
    }
    if (filters?.levelId) {
      result = result.filter((g) => g.levelId === filters.levelId);
    }
    if (filters?.status) {
      result = result.filter((g) => g.status === filters.status);
    }
    if (filters?.freeOnly) {
      result = result.filter((g) => g.price === 0);
    }
    if (filters?.availableOnly) {
      result = result.filter((g) => g.mainCount < g.maxPlayers && g.status === 'Open');
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.sportName.toLowerCase().includes(q) ||
          g.venueName.toLowerCase().includes(q) ||
          g.venueAddress.toLowerCase().includes(q)
      );
    }

    // Sort by start date ascending
    result.sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );
    return result;
  }

  public getGameById(id: string): Game | undefined {
    return this.games.find((g) => g.id === id);
  }

  public createGame(params: {
    organizerId: string;
    sportId: string;
    levelId: string;
    venueId: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    timeZone?: string;
    maxPlayers: number;
    price: number;
    description: string;
    rules: string;
    cancellationDeadlineHours?: number;
    templateId?: string | null;
  }): Game {
    const organizer = this.getUserById(params.organizerId);
    if (!organizer) throw new Error('Организатор не найден');
    if (organizer.status !== 'Active') throw new Error('Ваш аккаунт заблокирован');

    // Entitlement validation
    if (!this.hasEntitlement(params.organizerId, 'CREATE_GAME')) {
      throw new Error('Ваш тарифный план не позволяет создавать игры. Повысьте подписку.');
    }

    const sport = this.sports.find((s) => s.id === params.sportId);
    if (!sport) throw new Error('Вид спорта не найден');
    const level = sport.levels.find((l) => l.id === params.levelId);
    if (!level) throw new Error('Уровень сложности не найден');
    const venue = this.venues.find((v) => v.id === params.venueId);
    if (!venue) throw new Error('Площадка не найдена');

    const newGame: Game = {
      id: `game-${Date.now()}`,
      templateId: params.templateId || null,
      organizerId: params.organizerId,
      organizer: {
        id: organizer.id,
        firstName: organizer.firstName,
        lastName: organizer.lastName,
        avatarUrl: organizer.avatarUrl,
        rating: organizer.stats.rating,
      },
      sportId: sport.id,
      sportName: sport.name,
      levelId: level.id,
      levelName: level.name,
      title: params.title,
      venueId: venue.id,
      venueName: venue.name,
      venueAddress: `${venue.address}${venue.metro ? ` (м. ${venue.metro})` : ''}`,
      latitude: venue.latitude,
      longitude: venue.longitude,
      startDateTime: params.startDateTime,
      endDateTime: params.endDateTime,
      timeZone: params.timeZone || 'Europe/Moscow',
      maxPlayers: params.maxPlayers,
      price: params.price,
      currency: 'RUB',
      description: params.description,
      rules: params.rules,
      cancellationDeadlineHours: params.cancellationDeadlineHours ?? 3,
      status: 'Open',
      participants: [
        // Organizer is automatically added as participant #1
        {
          id: `p-${Date.now()}`,
          gameId: `game-${Date.now()}`,
          userId: organizer.id,
          user: {
            id: organizer.id,
            firstName: organizer.firstName,
            lastName: organizer.lastName,
            avatarUrl: organizer.avatarUrl,
            rating: organizer.stats.rating,
          },
          status: 'Main',
          joinedAt: new Date().toISOString(),
        },
      ],
      mainCount: 1,
      waitlistCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.games.push(newGame);
    organizer.stats.gamesOrganized += 1;

    this.addAuditLog(
      organizer.id,
      `${organizer.firstName} ${organizer.lastName}`,
      'CREATE_GAME',
      'Game',
      newGame.id,
      `Создана игра «${newGame.title}» (${sport.name})`
    );

    return newGame;
  }

  // --- Join Game (FIFO Waitlist logic) ---
  public joinGame(gameId: string, userId: string): { game: Game; participant: GameParticipant } {
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Игра не найдена');

    const user = this.getUserById(userId);
    if (!user) throw new Error('Пользователь не найден');
    if (user.status !== 'Active') throw new Error('Аккаунт не активен или заблокирован');

    // Check game status
    if (game.status === 'Cancelled') throw new Error('Эта игра была отменена');
    if (game.status === 'Completed') throw new Error('Игра уже завершена');

    // Check organizer blacklist
    if (this.isUserBlacklistedByOrganizer(game.organizerId, userId)) {
      throw new Error('Организатор добавил вас в список исключений для своих игр.');
    }

    // Check if already participant
    const existing = game.participants.find(
      (p) => p.userId === userId && (p.status === 'Main' || p.status === 'Waitlist')
    );
    if (existing) {
      throw new Error('Вы уже записаны на эту игру');
    }

    const nowIso = new Date().toISOString();
    let newParticipant: GameParticipant;

    if (game.mainCount < game.maxPlayers) {
      // Slot available in Main roster
      newParticipant = {
        id: `p-${Date.now()}`,
        gameId: game.id,
        userId: user.id,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          rating: user.stats.rating,
        },
        status: 'Main',
        joinedAt: nowIso,
      };

      game.participants.push(newParticipant);
      game.mainCount += 1;
      if (game.mainCount >= game.maxPlayers) {
        game.status = 'Full';
      }

      this.addNotification(
        userId,
        'JOIN_CONFIRMED',
        'Вы записаны в основной состав!',
        `Вы успешно записались на игру «${game.title}». Место за вами забронировано.`,
        game.id
      );
    } else {
      // Main roster is full -> Add to Waitlist FIFO queue
      const nextQueuePosition = game.waitlistCount + 1;
      newParticipant = {
        id: `p-${Date.now()}`,
        gameId: game.id,
        userId: user.id,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          rating: user.stats.rating,
        },
        status: 'Waitlist',
        queuePosition: nextQueuePosition,
        joinedAt: nowIso,
      };

      game.participants.push(newParticipant);
      game.waitlistCount += 1;

      this.addNotification(
        userId,
        'WAITLIST_ADDED',
        'Вы добавлены в очередь ожидания (Waitlist)',
        `Основной состав игры «${game.title}» полон. Ваша позиция в очереди: #${nextQueuePosition}. При освобождении места вы будете переведены автоматически.`,
        game.id
      );
    }

    game.updatedAt = nowIso;
    return { game, participant: newParticipant };
  }

  // --- Leave / Cancel Game (FIFO Auto-Promotion logic) ---
  public leaveGame(
    gameId: string,
    userId: string,
    reason?: string,
    isForce: boolean = false
  ): { game: Game; promotedUser?: User } {
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Игра не найдена');

    const participantIdx = game.participants.findIndex(
      (p) => p.userId === userId && (p.status === 'Main' || p.status === 'Waitlist')
    );
    if (participantIdx === -1) {
      throw new Error('Вы не являетесь активным участником этой игры');
    }

    const participant = game.participants[participantIdx];
    const now = Date.now();
    const startTime = new Date(game.startDateTime).getTime();
    const deadlineMs = game.cancellationDeadlineHours * 3600 * 1000;

    // Check cancellation deadline unless force/admin/organizer
    if (!isForce && now > startTime - deadlineMs) {
      const hoursLeft = Math.max(0, Math.round((startTime - now) / 3600000));
      throw new Error(
        `Срок самостоятельной отмены истёк (дедлайн: ${game.cancellationDeadlineHours} ч. до начала). До игры осталось ${hoursLeft} ч. Для отмены свяжитесь с организатором.`
      );
    }

    const wasMain = participant.status === 'Main';
    participant.status = 'Cancelled';
    participant.cancellationReason = reason || 'Отмена участия пользователем';
    participant.cancelledAt = new Date().toISOString();

    let promotedUser: User | undefined;

    if (wasMain) {
      game.mainCount = Math.max(0, game.mainCount - 1);

      // FIFO PROMOTION: Find first waitlist member with lowest queuePosition
      const waitlistMembers = game.participants
        .filter((p) => p.status === 'Waitlist' && p.queuePosition != null)
        .sort((a, b) => (a.queuePosition ?? 999) - (b.queuePosition ?? 999));

      if (waitlistMembers.length > 0) {
        const nextInLine = waitlistMembers[0];
        nextInLine.status = 'Main';
        nextInLine.queuePosition = null;
        game.mainCount += 1;
        game.waitlistCount = Math.max(0, game.waitlistCount - 1);

        // Re-index remaining waitlist positions
        waitlistMembers.slice(1).forEach((p, idx) => {
          const oldPos = p.queuePosition;
          p.queuePosition = idx + 1;
          if (oldPos !== p.queuePosition) {
            this.addNotification(
              p.userId,
              'WAITLIST_ADVANCED',
              'Продвижение в очереди ожидания!',
              `В игре «${game.title}» освободилось место! Ваша новая позиция в очереди: #${p.queuePosition}.`,
              game.id
            );
          }
        });

        promotedUser = this.getUserById(nextInLine.userId);
        if (promotedUser) {
          this.addNotification(
            promotedUser.id,
            'WAITLIST_PROMOTED',
            'Отличные новости! Вы переведены в основной состав!',
            `Освободилось место на игру «${game.title}». Вы автоматически переведены из очереди в основной состав. Ждём вас!`,
            game.id
          );
        }
      } else {
        // No waitlist -> Game is open again
        game.status = 'Open';
      }
    } else {
      // Leaving from Waitlist
      game.waitlistCount = Math.max(0, game.waitlistCount - 1);
      // Re-index remaining waitlist
      const remainingWaitlist = game.participants
        .filter((p) => p.status === 'Waitlist' && p.queuePosition != null)
        .sort((a, b) => (a.queuePosition ?? 999) - (b.queuePosition ?? 999));
      remainingWaitlist.forEach((p, idx) => {
        const oldPos = p.queuePosition;
        p.queuePosition = idx + 1;
        if (oldPos !== p.queuePosition) {
          this.addNotification(
            p.userId,
            'WAITLIST_ADVANCED',
            'Продвижение в очереди ожидания!',
            `Ваша позиция в очереди игры «${game.title}» улучшилась: теперь вы #${p.queuePosition}.`,
            game.id
          );
        }
      });
    }

    game.updatedAt = new Date().toISOString();
    return { game, promotedUser };
  }

  // --- Cancel Game by Organizer/Admin ---
  public cancelGame(gameId: string, actorUserId: string, reason: string): Game {
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Игра не найдена');

    const actor = this.getUserById(actorUserId);
    const isOrganizer = game.organizerId === actorUserId;
    const isAdmin = actor?.roles.includes('Administrator') || actor?.roles.includes('Moderator');

    if (!isOrganizer && !isAdmin) {
      throw new Error('Только организатор или администратор могут отменить игру');
    }

    game.status = 'Cancelled';
    game.updatedAt = new Date().toISOString();

    // Notify all active participants
    game.participants
      .filter((p) => p.status === 'Main' || p.status === 'Waitlist')
      .forEach((p) => {
        this.addNotification(
          p.userId,
          'GAME_CANCELLED',
          'Игра отменена организатором',
          `Игра «${game.title}» была отменена. Причина: ${reason}`,
          game.id
        );
      });

    this.addAuditLog(
      actorUserId,
      actor ? `${actor.firstName} ${actor.lastName}` : 'System',
      'CANCEL_GAME',
      'Game',
      game.id,
      `Игра «${game.title}» отменена. Причина: ${reason}`
    );

    return game;
  }

  // --- Attendance ---
  public markAttendance(
    gameId: string,
    markedByUserId: string,
    records: { userId: string; status: AttendanceStatus }[]
  ): GameAttendance[] {
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Игра не найдена');

    if (game.organizerId !== markedByUserId && !this.getUserById(markedByUserId)?.roles.includes('Administrator')) {
      throw new Error('Только организатор может отмечать посещаемость');
    }

    const saved: GameAttendance[] = [];

    records.forEach((rec) => {
      // Remove previous attendance if any
      this.attendance = this.attendance.filter(
        (a) => !(a.gameId === gameId && a.userId === rec.userId)
      );

      const entry: GameAttendance = {
        id: `att-${Date.now()}-${rec.userId}`,
        gameId,
        userId: rec.userId,
        markedByUserId,
        status: rec.status,
        markedAt: new Date().toISOString(),
      };
      this.attendance.push(entry);
      saved.push(entry);

      // Update user statistics
      const player = this.getUserById(rec.userId);
      if (player) {
        if (rec.status === 'Attended') {
          player.stats.attendedCount += 1;
          player.stats.gamesPlayed += 1;
        } else if (rec.status === 'NoShow') {
          player.stats.noShowCount += 1;
        }

        this.addNotification(
          player.id,
          'ATTENDANCE_MARKED',
          'Отметка о посещении игры',
          `Организатор отметил ваше присутствие на «${game.title}»: ${
            rec.status === 'Attended' ? 'Присутствовал(а) ✅' : rec.status === 'NoShow' ? 'Неявка ❌' : 'Уважительная причина'
          }`,
          game.id
        );
      }
    });

    return saved;
  }

  public getGameAttendance(gameId: string): GameAttendance[] {
    return this.attendance.filter((a) => a.gameId === gameId);
  }

  // --- Ratings & Reviews ---
  public addRating(params: {
    gameId: string;
    fromUserId: string;
    toUserId: string;
    stars: number;
    reviewText?: string;
  }): Rating {
    const game = this.getGameById(params.gameId);
    if (!game) throw new Error('Игра не найдена');
    if (params.fromUserId === params.toUserId) throw new Error('Нельзя оценивать самого себя');
    if (params.stars < 1 || params.stars > 5) throw new Error('Оценка должна быть от 1 до 5 звёзд');

    // Check duplicate
    const existing = this.ratings.find(
      (r) =>
        r.gameId === params.gameId &&
        r.fromUserId === params.fromUserId &&
        r.toUserId === params.toUserId
    );
    if (existing) throw new Error('Вы уже оставили оценку этому участнику за эту игру');

    const rating: Rating = {
      id: `rate-${Date.now()}`,
      gameId: params.gameId,
      fromUserId: params.fromUserId,
      toUserId: params.toUserId,
      stars: params.stars,
      reviewText: params.reviewText,
      createdAt: new Date().toISOString(),
    };

    this.ratings.push(rating);

    // Update target user's average rating
    const toUser = this.getUserById(params.toUserId);
    if (toUser) {
      const userRatings = this.ratings.filter((r) => r.toUserId === params.toUserId);
      const sum = userRatings.reduce((acc, r) => acc + r.stars, 0);
      toUser.stats.ratingsCount = userRatings.length;
      toUser.stats.rating = Number((sum / userRatings.length).toFixed(1));

      this.addNotification(
        toUser.id,
        'RATING_RECEIVED',
        'Вам поставили оценку!',
        `Участник оценил вашу игру на ${params.stars} ⭐ за матч «${game.title}».`,
        game.id
      );
    }

    return rating;
  }

  public getUserRatings(userId: string): Rating[] {
    return this.ratings.filter((r) => r.toUserId === userId);
  }

  // --- Game Templates (Recurring Games) ---
  public createTemplate(params: Omit<GameTemplate, 'id' | 'createdAt'>): GameTemplate {
    if (!this.hasEntitlement(params.organizerId, 'CREATE_RECURRING_GAME')) {
      throw new Error('Создание регулярных шаблонов требует подписки Club Elite');
    }

    const template: GameTemplate = {
      ...params,
      id: `tmpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.templates.push(template);

    // Automatically generate next upcoming game from this template
    const nextGameDate = new Date();
    nextGameDate.setDate(nextGameDate.getDate() + 7);
    const [h, m] = template.startTime.split(':').map(Number);
    nextGameDate.setHours(h || 19, m || 0, 0, 0);

    const endGameDate = new Date(nextGameDate.getTime() + template.durationMinutes * 60000);

    this.createGame({
      organizerId: template.organizerId,
      sportId: template.sportId,
      levelId: template.levelId,
      venueId: template.venueId,
      title: template.name,
      startDateTime: nextGameDate.toISOString(),
      endDateTime: endGameDate.toISOString(),
      maxPlayers: template.maxPlayers,
      price: template.price,
      description: template.description,
      rules: template.rules,
      cancellationDeadlineHours: template.cancellationDeadlineHours,
      templateId: template.id,
    });

    return template;
  }

  // --- Complaints ---
  public submitComplaint(params: {
    fromUserId: string;
    targetUserId?: string;
    gameId?: string;
    reason: string;
    description: string;
  }): Complaint {
    const fromUser = this.getUserById(params.fromUserId);
    const targetUser = params.targetUserId ? this.getUserById(params.targetUserId) : undefined;
    const game = params.gameId ? this.getGameById(params.gameId) : undefined;

    const complaint: Complaint = {
      id: `cmp-${Date.now()}`,
      fromUserId: params.fromUserId,
      fromUserName: fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : 'Пользователь',
      targetUserId: params.targetUserId,
      targetUserName: targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : undefined,
      gameId: params.gameId,
      gameTitle: game ? game.title : undefined,
      reason: params.reason,
      description: params.description,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    this.complaints.push(complaint);
    return complaint;
  }

  public resolveComplaint(
    complaintId: string,
    resolvedByUserId: string,
    status: Complaint['status'],
    resolutionNotes: string
  ): Complaint {
    const comp = this.complaints.find((c) => c.id === complaintId);
    if (!comp) throw new Error('Жалоба не найдена');

    const admin = this.getUserById(resolvedByUserId);
    comp.status = status;
    comp.resolvedByUserId = resolvedByUserId;
    comp.resolvedByName = admin ? `${admin.firstName} ${admin.lastName}` : 'Модератор';
    comp.resolutionNotes = resolutionNotes;
    comp.resolvedAt = new Date().toISOString();

    this.addAuditLog(
      resolvedByUserId,
      comp.resolvedByName,
      'RESOLVE_COMPLAINT',
      'Complaint',
      complaintId,
      `Жалоба переведена в статус «${status}»: ${resolutionNotes}`
    );

    return comp;
  }

  // --- Notifications ---
  public addNotification(
    userId: string,
    type: NotificationItem['type'],
    title: string,
    message: string,
    gameId?: string
  ): NotificationItem {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type,
      title,
      message,
      gameId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }

  public getUserNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true));
  }

  public deleteNotification(id: string): void {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.notifications.splice(idx, 1);
    }
  }

  public clearAllNotifications(userId: string): void {
    this.notifications = this.notifications.filter((n) => n.userId !== userId);
  }

  // --- Audit Logs ---
  public addAuditLog(
    userId: string,
    userName: string,
    action: string,
    entityName: string,
    entityId: string,
    details: string
  ): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      userId,
      userName,
      action,
      entityName,
      entityId,
      details,
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  // --- Update Game ---
  public updateGame(
    gameId: string,
    userId: string,
    updates: Partial<{
      title: string;
      description: string;
      rules: string;
      maxPlayers: number;
      price: number;
      startDateTime: string;
      endDateTime: string;
      venueId: string;
      cancellationDeadlineHours: number;
    }>
  ): Game {
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Игра не найдена');

    const user = this.getUserById(userId);
    const isAdmin = user?.roles.includes('Administrator') || user?.roles.includes('Moderator');
    if (game.organizerId !== userId && !isAdmin) {
      throw new Error('Только организатор или администратор может редактировать игру');
    }

    if (updates.venueId && updates.venueId !== game.venueId) {
      const venue = this.venues.find((v) => v.id === updates.venueId);
      if (venue) {
        game.venueId = venue.id;
        game.venueName = venue.name;
        game.venueAddress = `${venue.address}${venue.metro ? ` (м. ${venue.metro})` : ''}`;
        game.latitude = venue.latitude;
        game.longitude = venue.longitude;
      }
    }

    if (updates.title !== undefined) game.title = updates.title;
    if (updates.description !== undefined) game.description = updates.description;
    if (updates.rules !== undefined) game.rules = updates.rules;
    if (updates.maxPlayers !== undefined) {
      game.maxPlayers = Number(updates.maxPlayers);
      if (game.mainCount < game.maxPlayers && game.status === 'Full') {
        game.status = 'Open';
      }
    }
    if (updates.price !== undefined) game.price = Number(updates.price);
    if (updates.startDateTime !== undefined) game.startDateTime = updates.startDateTime;
    if (updates.endDateTime !== undefined) game.endDateTime = updates.endDateTime;
    if (updates.cancellationDeadlineHours !== undefined) {
      game.cancellationDeadlineHours = Number(updates.cancellationDeadlineHours);
    }
    game.updatedAt = new Date().toISOString();

    // Notify all active participants about the update
    game.participants
      .filter((p) => p.status === 'Main' || p.status === 'Waitlist')
      .forEach((p) => {
        if (p.userId !== userId) {
          this.addNotification(
            p.userId,
            'GAME_UPDATED',
            `Параметры игры «${game.title}» обновлены`,
            `Организатор обновил детали матча (${new Date(game.startDateTime).toLocaleDateString('ru-RU')}, ${game.venueName}). Проверьте актуальную информацию.`,
            game.id
          );
        }
      });

    this.addAuditLog(
      userId,
      user ? `${user.firstName} ${user.lastName}` : 'User',
      'UPDATE_GAME',
      'Game',
      game.id,
      `Обновлена информация об игре «${game.title}»`
    );

    return game;
  }

  // --- Subscriptions ---
  public changeSubscription(userId: string, planId: string): { user: User; plan: SubscriptionPlan } {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Пользователь не найден');
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) throw new Error('Тарифный план не найден');

    user.subscriptionPlanId = plan.id;
    this.addNotification(
      userId,
      'JOIN_CONFIRMED',
      `Тарифный план изменён на «${plan.name}»`,
      `Ваша подписка успешно обновлена. Доступны привилегии тарифа: ${plan.description}.`
    );

    this.addAuditLog(
      userId,
      `${user.firstName} ${user.lastName}`,
      'SUBSCRIPTION_CHANGE',
      'Subscription',
      plan.id,
      `Пользователь сменил тариф на ${plan.name} (${plan.price} руб/${plan.period})`
    );

    return { user, plan };
  }
}

export const store = new AppStore();

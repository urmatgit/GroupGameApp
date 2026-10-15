import { Router, Request, Response } from 'express';
import { store } from './store.ts';

export const apiRouter = Router();

// Helper to get active user ID from x-user-id header or authorization Bearer
const getUserId = (req: Request): string => {
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId) return headerUserId;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  // Default to Alexey for easy testing if no header is supplied
  return 'user-organizer-alexey';
};

// --- AUTH & USERS ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = store.users.find((u) => u.email.toLowerCase() === email?.toLowerCase()) || store.users[0];
  res.json({ token: user.id, user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, firstName, lastName, phone, cityId } = req.body;
  const city = store.cities.find((c) => c.id === cityId) || store.cities[0];

  const newUser = {
    id: `user-${Date.now()}`,
    email: email || `user${Date.now()}@mail.ru`,
    firstName: firstName || 'Спортсмен',
    lastName: lastName || 'Новый',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName || 'Спорт')}`,
    phone: phone || '+7 (900) 000-00-00',
    cityId: city.id,
    cityName: city.name,
    roles: ['User'] as any,
    status: 'Active' as any,
    createdAt: new Date().toISOString(),
    sports: [{ sportId: 'sport-volleyball', levelId: 'lvl-vb-1' }],
    subscriptionPlanId: 'plan-free',
    stats: {
      gamesOrganized: 0,
      gamesPlayed: 0,
      attendedCount: 0,
      noShowCount: 0,
      rating: 5.0,
      ratingsCount: 0,
    },
  };

  store.users.push(newUser);
  res.status(201).json({ token: newUser.id, user: newUser });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = store.users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
  // Even if not found, simulate secure response
  if (user) {
    store.addNotification(
      user.id,
      'REMINDER',
      'Запрос на сброс пароля',
      'Был получен запрос на сброс пароля. Если это были не вы, проигнорируйте это сообщение.'
    );
  }
  res.json({ success: true, message: 'Инструкции по восстановлению пароля отправлены на указанный email' });
});

apiRouter.get('/users/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = store.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

apiRouter.put('/users/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const updated = store.updateUser(userId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/users/me/subscription', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { planId } = req.body;
  try {
    const result = store.changeSubscription(userId, planId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/users/:id', (req: Request, res: Response) => {
  const user = store.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

// --- METADATA CATALOGS ---
apiRouter.get('/cities', (_req: Request, res: Response) => {
  res.json(store.cities);
});

apiRouter.get('/sports', (_req: Request, res: Response) => {
  res.json(store.sports);
});

apiRouter.get('/venues', (req: Request, res: Response) => {
  const cityId = req.query.cityId as string;
  const venues = cityId ? store.venues.filter((v) => v.cityId === cityId) : store.venues;
  res.json(venues);
});

apiRouter.get('/plans', (_req: Request, res: Response) => {
  res.json(store.plans);
});

// --- GAMES ---
apiRouter.get('/games', (req: Request, res: Response) => {
  const { sportId, levelId, status, freeOnly, availableOnly, searchQuery } = req.query;
  const games = store.getGames({
    sportId: sportId as string,
    levelId: levelId as string,
    status: status as string,
    freeOnly: freeOnly === 'true',
    availableOnly: availableOnly === 'true',
    searchQuery: searchQuery as string,
  });
  res.json(games);
});

apiRouter.get('/games/:id', (req: Request, res: Response) => {
  const game = store.getGameById(req.params.id);
  if (!game) return res.status(404).json({ error: 'Игра не найдена' });
  res.json(game);
});

apiRouter.post('/games', (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const newGame = store.createGame({
      ...req.body,
      organizerId: userId,
    });
    res.status(201).json(newGame);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/games/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const updated = store.updateGame(req.params.id, userId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/games/:id/join', (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const result = store.joinGame(req.params.id, userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/games/:id/leave', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { reason, force } = req.body;
  try {
    const result = store.leaveGame(req.params.id, userId, reason, force === true);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/games/:id/cancel', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { reason } = req.body;
  try {
    const game = store.cancelGame(req.params.id, userId, reason || 'Отменено организатором');
    res.json(game);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- ATTENDANCE ---
apiRouter.post('/games/:id/attendance', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { records } = req.body; // array of { userId, status }
  try {
    const attendance = store.markAttendance(req.params.id, userId, records || []);
    res.json(attendance);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/games/:id/attendance', (req: Request, res: Response) => {
  res.json(store.getGameAttendance(req.params.id));
});

// --- RATINGS & REVIEWS ---
apiRouter.post('/games/:id/ratings', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { toUserId, stars, reviewText } = req.body;
  try {
    const rating = store.addRating({
      gameId: req.params.id,
      fromUserId: userId,
      toUserId,
      stars: Number(stars),
      reviewText,
    });
    res.status(201).json(rating);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/users/:id/ratings', (req: Request, res: Response) => {
  res.json(store.getUserRatings(req.params.id));
});

// --- RECURRING TEMPLATES ---
apiRouter.get('/game-templates', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const templates = store.templates.filter((t) => t.organizerId === userId);
  res.json(templates);
});

apiRouter.post('/game-templates', (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const template = store.createTemplate({
      ...req.body,
      organizerId: userId,
    });
    res.status(201).json(template);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- BLACKLIST ---
apiRouter.get('/blacklist', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const list = store.blacklist.filter((b) => b.ownerUserId === userId);
  res.json(list);
});

apiRouter.post('/blacklist', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { blockedUserId, reason } = req.body;
  try {
    const entry = store.addToBlacklist(userId, blockedUserId, reason);
    res.status(201).json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/blacklist/:userId', (req: Request, res: Response) => {
  const userId = getUserId(req);
  store.removeFromBlacklist(userId, req.params.userId);
  res.json({ success: true });
});

// --- NOTIFICATIONS ---
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const userId = getUserId(req);
  res.json(store.getUserNotifications(userId));
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  store.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const userId = getUserId(req);
  store.markAllNotificationsAsRead(userId);
  res.json({ success: true });
});

apiRouter.delete('/notifications/:id', (req: Request, res: Response) => {
  store.deleteNotification(req.params.id);
  res.json({ success: true });
});

apiRouter.delete('/notifications', (req: Request, res: Response) => {
  const userId = getUserId(req);
  store.clearAllNotifications(userId);
  res.json({ success: true });
});

apiRouter.post('/notifications/test', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { type, title, message, gameId } = req.body;
  const sampleGame = store.games[0];
  const notifType = type || 'WAITLIST_PROMOTED';
  const targetGameId = gameId || (sampleGame ? sampleGame.id : undefined);
  const targetGameTitle = sampleGame ? sampleGame.title : 'Вечерний волейбол';

  let defaultTitle = 'Продвижение из очереди!';
  let defaultMessage = `Вы переведены из очереди ожидания в основной состав игры «${targetGameTitle}»! Место подтверждено.`;

  if (notifType === 'GAME_CANCELLED') {
    defaultTitle = 'Матч отменён организатором';
    defaultMessage = `К сожалению, игра «${targetGameTitle}» была отменена организатором по техническим причинам.`;
  } else if (notifType === 'WAITLIST_ADVANCED') {
    defaultTitle = 'Продвижение в очереди ожидания!';
    defaultMessage = `В игре «${targetGameTitle}» освободилось место! Ваша позиция в очереди теперь: #1.`;
  } else if (notifType === 'STATUS_CHANGED' || notifType === 'JOIN_CONFIRMED') {
    defaultTitle = 'Статус записи изменён';
    defaultMessage = `Ваша запись на игру «${targetGameTitle}» подтверждена в основном составе.`;
  }

  const notif = store.addNotification(
    userId,
    notifType,
    title || defaultTitle,
    message || defaultMessage,
    targetGameId
  );
  res.status(201).json(notif);
});

// --- COMPLAINTS ---
apiRouter.post('/complaints', (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const complaint = store.submitComplaint({
      ...req.body,
      fromUserId: userId,
    });
    res.status(201).json(complaint);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- ADMIN ENDPOINTS ---
apiRouter.get('/admin/complaints', (_req: Request, res: Response) => {
  res.json(store.complaints);
});

apiRouter.post('/admin/complaints/:id/resolve', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { status, notes } = req.body;
  try {
    const resolved = store.resolveComplaint(req.params.id, userId, status, notes);
    res.json(resolved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/users', (_req: Request, res: Response) => {
  res.json(store.users);
});

apiRouter.post('/admin/users/:id/status', (req: Request, res: Response) => {
  const adminUserId = getUserId(req);
  const { status } = req.body;
  try {
    const user = store.setUserStatus(req.params.id, status, adminUserId);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/audit', (_req: Request, res: Response) => {
  res.json(store.auditLogs);
});

apiRouter.get('/admin/stats', (_req: Request, res: Response) => {
  const totalGames = store.games.length;
  const activeGames = store.games.filter((g) => g.status === 'Open' || g.status === 'Full').length;
  const totalUsers = store.users.length;
  const totalAttendance = store.attendance.length;
  const attendedCount = store.attendance.filter((a) => a.status === 'Attended').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((attendedCount / totalAttendance) * 100) : 100;
  const totalWaitlist = store.games.reduce((acc, g) => acc + g.waitlistCount, 0);

  res.json({
    totalGames,
    activeGames,
    totalUsers,
    attendanceRate,
    totalWaitlist,
    complaintsCount: store.complaints.filter((c) => c.status === 'Pending').length,
  });
});

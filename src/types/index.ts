export type SystemRole = 'User' | 'Moderator' | 'Administrator';

export type UserAccountStatus = 'Active' | 'Suspended' | 'Blocked' | 'Deleted';

export type GameStatus =
  | 'Draft'
  | 'Open'
  | 'Full'
  | 'StartingSoon'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export type ParticipantStatus = 'Main' | 'Waitlist' | 'Cancelled' | 'Removed';

export type AttendanceStatus = 'Attended' | 'NoShow' | 'Excused';

export type RecurrenceType = 'Weekly' | 'BiWeekly' | 'Monthly';

export type ComplaintStatus = 'Pending' | 'Investigating' | 'Resolved' | 'Dismissed';

export interface City {
  id: string;
  name: string;
  country: string;
}

export interface SportLevel {
  id: string;
  sportId: string;
  name: string; // e.g. "Beginner" (Новичок), "Intermediate" (Любитель), "Advanced" (Продвинутый)
  description?: string;
  order: number;
}

export interface Sport {
  id: string;
  name: string; // "Волейбол", "Баскетбол", "Футбол", "Большой теннис"
  icon: string;
  description: string;
  levels: SportLevel[];
}

export interface UserSport {
  sportId: string;
  levelId: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  phone: string;
  cityId: string;
  cityName: string;
  roles: SystemRole[];
  status: UserAccountStatus;
  createdAt: string;
  sports: UserSport[];
  subscriptionPlanId?: string;
  stats: {
    gamesOrganized: number;
    gamesPlayed: number;
    attendedCount: number;
    noShowCount: number;
    rating: number; // 1.0 - 5.0
    ratingsCount: number;
  };
}

export interface Venue {
  id: string;
  name: string;
  cityId: string;
  address: string;
  metro?: string;
  facilities: string[];
  latitude?: number;
  longitude?: number;
}

export interface GameParticipant {
  id: string;
  gameId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    rating: number;
  };
  status: ParticipantStatus;
  queuePosition?: number | null; // 1, 2, 3... for Waitlist FIFO
  joinedAt: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface Game {
  id: string;
  templateId?: string | null;
  organizerId: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    rating: number;
  };
  sportId: string;
  sportName: string;
  levelId: string;
  levelName: string;
  title: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
  latitude?: number;
  longitude?: number;
  startDateTime: string; // ISO 8601 UTC
  endDateTime: string;   // ISO 8601 UTC
  timeZone: string;      // e.g. "Europe/Moscow"
  maxPlayers: number;
  price: number;         // 0 for free
  currency: string;
  description: string;
  rules: string;
  cancellationDeadlineHours: number; // default: 3 hours before start
  status: GameStatus;
  participants: GameParticipant[];
  mainCount: number;
  waitlistCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameTemplate {
  id: string;
  organizerId: string;
  sportId: string;
  levelId: string;
  venueId: string;
  name: string;
  startTime: string; // e.g. "19:30"
  durationMinutes: number;
  recurrenceType: RecurrenceType;
  daysOfWeek: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
  startDate: string;
  endDate?: string;
  maxPlayers: number;
  price: number;
  description: string;
  rules: string;
  cancellationDeadlineHours: number;
  isActive: boolean;
  createdAt: string;
}

export interface GameAttendance {
  id: string;
  gameId: string;
  userId: string;
  markedByUserId: string;
  status: AttendanceStatus;
  markedAt: string;
}

export interface Rating {
  id: string;
  gameId: string;
  fromUserId: string;
  toUserId: string;
  stars: number; // 1..5
  reviewText?: string;
  createdAt: string;
}

export interface BlacklistEntry {
  id: string;
  ownerUserId: string;
  blockedUserId: string;
  blockedUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  reason?: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  fromUserId: string;
  fromUserName: string;
  targetUserId?: string;
  targetUserName?: string;
  gameId?: string;
  gameTitle?: string;
  reason: string;
  description: string;
  status: ComplaintStatus;
  resolvedByUserId?: string;
  resolvedByName?: string;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | 'JOIN_CONFIRMED'
    | 'WAITLIST_ADDED'
    | 'WAITLIST_PROMOTED'
    | 'GAME_CANCELLED'
    | 'GAME_UPDATED'
    | 'REMINDER'
    | 'ATTENDANCE_MARKED'
    | 'RATING_RECEIVED'
    | 'COMPLAINT_UPDATE';
  title: string;
  message: string;
  gameId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Entitlement {
  id: string;
  code: 'CREATE_GAME' | 'CREATE_RECURRING_GAME' | 'ADVANCED_SEARCH' | 'ADVANCED_STATISTICS';
  name: string;
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  entitlements: Entitlement['code'][];
  gameCreationLimitPerMonth?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

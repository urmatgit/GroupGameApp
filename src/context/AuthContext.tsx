import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, NotificationItem } from '../types/index.ts';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshUser: () => Promise<void>;
  activeCityId: string;
  setActiveCityId: (cityId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-player-dmitry',
    email: 'dmitry.player@mail.ru',
    firstName: 'Дмитрий',
    lastName: 'Иванов',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+7 (926) 333-22-11',
    cityId: 'city-1',
    cityName: 'Москва',
    roles: ['User'],
    status: 'Active',
    createdAt: '2025-03-15T12:00:00Z',
    sports: [{ sportId: 'sport-volleyball', levelId: 'lvl-vb-2' }],
    subscriptionPlanId: 'plan-free',
    stats: {
      gamesOrganized: 2,
      gamesPlayed: 19,
      attendedCount: 19,
      noShowCount: 0,
      rating: 4.8,
      ratingsCount: 16,
    },
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeCityId, setActiveCityId] = useState<string>('city-1');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    refreshNotifications();
  }, [currentUser.id]);

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        refreshNotifications,
        refreshUser,
        activeCityId,
        setActiveCityId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GroupGame.Domain.Entities;

namespace GroupGame.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<UserSession> UserSessions { get; }
    DbSet<City> Cities { get; }
    DbSet<Sport> Sports { get; }
    DbSet<SportLevel> SportLevels { get; }
    DbSet<UserSport> UserSports { get; }
    DbSet<Venue> Venues { get; }
    DbSet<GameTemplate> GameTemplates { get; }
    DbSet<Game> Games { get; }
    DbSet<GameParticipant> GameParticipants { get; }
    DbSet<GameAttendance> GameAttendances { get; }
    DbSet<GameHistory> GameHistories { get; }
    DbSet<Rating> Ratings { get; }
    DbSet<Review> Reviews { get; }
    DbSet<BlacklistEntry> BlacklistEntries { get; }
    DbSet<Complaint> Complaints { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<SubscriptionPlan> SubscriptionPlans { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<Entitlement> Entitlements { get; }
    DbSet<PlanEntitlement> PlanEntitlements { get; }
    DbSet<SubscriptionUsage> SubscriptionUsages { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

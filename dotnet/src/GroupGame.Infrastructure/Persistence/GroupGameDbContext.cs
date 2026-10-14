using System;
using Microsoft.EntityFrameworkCore;
using GroupGame.Application.Common.Interfaces;
using GroupGame.Domain.Entities;
using GroupGame.Domain.Enums;

namespace GroupGame.Infrastructure.Persistence;

public class GroupGameDbContext : DbContext, IApplicationDbContext
{
    public GroupGameDbContext(DbContextOptions<GroupGameDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Sport> Sports => Set<Sport>();
    public DbSet<SportLevel> SportLevels => Set<SportLevel>();
    public DbSet<UserSport> UserSports => Set<UserSport>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<GameTemplate> GameTemplates => Set<GameTemplate>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<GameParticipant> GameParticipants => Set<GameParticipant>();
    public DbSet<GameAttendance> GameAttendances => Set<GameAttendance>();
    public DbSet<GameHistory> GameHistories => Set<GameHistory>();
    public DbSet<Rating> Ratings => Set<Rating>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<BlacklistEntry> BlacklistEntries => Set<BlacklistEntry>();
    public DbSet<Complaint> Complaints => Set<Complaint>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Entitlement> Entitlements => Set<Entitlement>();
    public DbSet<PlanEntitlement> PlanEntitlements => Set<PlanEntitlement>();
    public DbSet<SubscriptionUsage> SubscriptionUsages => Set<SubscriptionUsage>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // PostgreSQL UUID extension
        modelBuilder.HasPostgresExtension("uuid-ossp");

        // 1. Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.City)
                .WithMany(c => c.Users)
                .HasForeignKey(e => e.CityId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 2. Roles
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasConversion<string>();
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");
            entity.HasKey(e => new { e.UserId, e.RoleId });
            entity.HasOne(e => e.User).WithMany(u => u.UserRoles).HasForeignKey(e => e.UserId);
            entity.HasOne(e => e.Role).WithMany(r => r.UserRoles).HasForeignKey(e => e.RoleId);
        });

        // 3. UserSession
        modelBuilder.Entity<UserSession>(entity =>
        {
            entity.ToTable("user_sessions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RefreshTokenHash).IsUnique();
        });

        // 4. Cities & Venues
        modelBuilder.Entity<City>(entity =>
        {
            entity.ToTable("cities");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        modelBuilder.Entity<Venue>(entity =>
        {
            entity.ToTable("venues");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.City).WithMany(c => c.Venues).HasForeignKey(e => e.CityId).OnDelete(DeleteBehavior.Restrict);
        });

        // 5. Sports & Levels
        modelBuilder.Entity<Sport>(entity =>
        {
            entity.ToTable("sports");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        modelBuilder.Entity<SportLevel>(entity =>
        {
            entity.ToTable("sport_levels");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Sport).WithMany(s => s.Levels).HasForeignKey(e => e.SportId).OnDelete(DeleteBehavior.Cascade);
        });

        // 6. Games
        modelBuilder.Entity<Game>(entity =>
        {
            entity.ToTable("games");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Organizer)
                .WithMany(u => u.OrganizedGames)
                .HasForeignKey(e => e.OrganizerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Sport).WithMany().HasForeignKey(e => e.SportId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Level).WithMany().HasForeignKey(e => e.LevelId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Venue).WithMany().HasForeignKey(e => e.VenueId).OnDelete(DeleteBehavior.Restrict);

            entity.ToTable(t => t.HasCheckConstraint("chk_game_times", "end_date_time > start_date_time"));
        });

        // 7. GameParticipants (Main & Waitlist FIFO)
        modelBuilder.Entity<GameParticipant>(entity =>
        {
            entity.ToTable("game_participants");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.GameId, e.UserId }).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Game)
                .WithMany(g => g.Participants)
                .HasForeignKey(e => e.GameId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Participations)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 8. Attendance
        modelBuilder.Entity<GameAttendance>(entity =>
        {
            entity.ToTable("game_attendance");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.GameId, e.UserId }).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();
        });

        // 9. Ratings & Reviews
        modelBuilder.Entity<Rating>(entity =>
        {
            entity.ToTable("ratings");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.GameId, e.FromUserId, e.ToUserId }).IsUnique();
            entity.ToTable(t => t.HasCheckConstraint("chk_stars_range", "stars >= 1 AND stars <= 5"));
            entity.ToTable(t => t.HasCheckConstraint("chk_no_self_rating", "from_user_id <> to_user_id"));
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("reviews");
            entity.HasKey(e => e.Id);
            entity.HasOne(r => r.Rating).WithOne(rat => rat.Review).HasForeignKey<Review>(r => r.RatingId).OnDelete(DeleteBehavior.Cascade);
        });

        // 10. Blacklist
        modelBuilder.Entity<BlacklistEntry>(entity =>
        {
            entity.ToTable("blacklist_entries");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.OwnerUserId, e.BlockedUserId }).IsUnique();
            entity.ToTable(t => t.HasCheckConstraint("chk_no_self_block", "owner_user_id <> blocked_user_id"));
        });
    }
}

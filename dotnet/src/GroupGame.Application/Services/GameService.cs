using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GroupGame.Application.Common.Interfaces;
using GroupGame.Application.DTOs;
using GroupGame.Domain.Entities;
using GroupGame.Domain.Enums;

namespace GroupGame.Application.Services;

public class GameService
{
    private readonly IApplicationDbContext _context;

    public GameService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<JoinGameResultDto> JoinGameAsync(Guid gameId, Guid userId, CancellationToken ct = default)
    {
        var game = await _context.Games
            .Include(g => g.Participants)
                .ThenInclude(p => p.User)
            .Include(g => g.Organizer)
            .Include(g => g.Sport)
            .Include(g => g.Level)
            .Include(g => g.Venue)
            .FirstOrDefaultAsync(g => g.Id == gameId, ct);

        if (game == null)
            throw new KeyNotFoundException("Игра не найдена");

        var user = await _context.Users.FindAsync(new object[] { userId }, ct);
        if (user == null)
            throw new KeyNotFoundException("Пользователь не найден");

        if (user.Status != UserAccountStatus.Active)
            throw new InvalidOperationException("Ваш аккаунт заблокирован или приостановлен");

        if (game.Status == GameStatus.Cancelled)
            throw new InvalidOperationException("Матч был отменен");

        if (game.Status == GameStatus.Completed)
            throw new InvalidOperationException("Матч уже завершен");

        // Check Organizer personal Blacklist (Section 13 & 22)
        var isBlacklisted = await _context.BlacklistEntries.AnyAsync(
            b => b.OwnerUserId == game.OrganizerId && b.BlockedUserId == userId, ct);

        if (isBlacklisted)
            throw new UnauthorizedAccessException("Организатор ограничил ваше участие в своих играх");

        // Check if already active participant
        var existing = game.Participants.FirstOrDefault(
            p => p.UserId == userId && (p.Status == ParticipantStatus.Main || p.Status == ParticipantStatus.Waitlist));

        if (existing != null)
            throw new InvalidOperationException("Вы уже записаны на эту игру");

        var mainCount = game.Participants.Count(p => p.Status == ParticipantStatus.Main);
        var waitlistMembers = game.Participants
            .Where(p => p.Status == ParticipantStatus.Waitlist)
            .OrderBy(p => p.QueuePosition ?? 999)
            .ToList();

        GameParticipant participant;
        string message;

        if (mainCount < game.MaxPlayers)
        {
            participant = new GameParticipant
            {
                GameId = game.Id,
                UserId = user.Id,
                Status = ParticipantStatus.Main,
                QueuePosition = null,
                JoinedAt = DateTime.UtcNow
            };

            game.Participants.Add(participant);
            if (mainCount + 1 >= game.MaxPlayers)
            {
                game.Status = GameStatus.Full;
            }

            message = "Вы успешно записаны в основной состав!";

            _context.Notifications.Add(new Notification
            {
                UserId = user.Id,
                Type = "JOIN_CONFIRMED",
                Title = "Запись в основной состав!",
                Message = $"Вы записаны на «{game.Title}». Место забронировано.",
                GameId = game.Id
            });
        }
        else
        {
            // Main is full -> Add to Waitlist FIFO queue
            int nextQueuePos = waitlistMembers.Count + 1;
            participant = new GameParticipant
            {
                GameId = game.Id,
                UserId = user.Id,
                Status = ParticipantStatus.Waitlist,
                QueuePosition = nextQueuePos,
                JoinedAt = DateTime.UtcNow
            };

            game.Participants.Add(participant);
            message = $"Вы добавлены в очередь ожидания: позиция #{nextQueuePos}";

            _context.Notifications.Add(new Notification
            {
                UserId = user.Id,
                Type = "WAITLIST_ADDED",
                Title = "Очередь ожидания (Waitlist)",
                Message = $"Основной состав полон. Ваша позиция в очереди: #{nextQueuePos}.",
                GameId = game.Id
            });
        }

        game.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return new JoinGameResultDto(MapToDto(game), MapParticipantToDto(participant, user), message);
    }

    public async Task<LeaveGameResultDto> LeaveGameAsync(Guid gameId, Guid userId, string? reason, bool force = false, CancellationToken ct = default)
    {
        var game = await _context.Games
            .Include(g => g.Participants)
                .ThenInclude(p => p.User)
            .Include(g => g.Organizer)
            .Include(g => g.Sport)
            .Include(g => g.Level)
            .Include(g => g.Venue)
            .FirstOrDefaultAsync(g => g.Id == gameId, ct);

        if (game == null)
            throw new KeyNotFoundException("Игра не найдена");

        var participant = game.Participants.FirstOrDefault(
            p => p.UserId == userId && (p.Status == ParticipantStatus.Main || p.Status == ParticipantStatus.Waitlist));

        if (participant == null)
            throw new InvalidOperationException("Вы не являетесь активным участником этого матча");

        // Validate Cancellation Deadline (Section 10 & 30.3)
        var deadlineLimit = game.StartDateTime.AddHours(-game.CancellationDeadlineHours);
        if (!force && DateTime.UtcNow > deadlineLimit)
        {
            throw new InvalidOperationException(
                $"Срок самостоятельной отмены истёк (дедлайн: за {game.CancellationDeadlineHours} ч. до начала). Обратитесь к организатору.");
        }

        bool wasMain = participant.Status == ParticipantStatus.Main;
        participant.Status = ParticipantStatus.Cancelled;
        participant.CancellationReason = reason ?? "Самостоятельная отмена";
        participant.CancelledAt = DateTime.UtcNow;

        User? promotedUser = null;
        string message = "Запись отменена.";

        if (wasMain)
        {
            // FIFO PROMOTION: Find first candidate in Waitlist
            var waitlistCandidate = game.Participants
                .Where(p => p.Status == ParticipantStatus.Waitlist)
                .OrderBy(p => p.QueuePosition ?? 999)
                .FirstOrDefault();

            if (waitlistCandidate != null)
            {
                waitlistCandidate.Status = ParticipantStatus.Main;
                waitlistCandidate.QueuePosition = null;

                promotedUser = waitlistCandidate.User;

                // Re-index remaining waitlist positions
                var remainingWaitlist = game.Participants
                    .Where(p => p.Status == ParticipantStatus.Waitlist)
                    .OrderBy(p => p.QueuePosition ?? 999)
                    .ToList();

                for (int i = 0; i < remainingWaitlist.Count; i++)
                {
                    remainingWaitlist[i].QueuePosition = i + 1;
                }

                _context.Notifications.Add(new Notification
                {
                    UserId = promotedUser.Id,
                    Type = "WAITLIST_PROMOTED",
                    Title = "Вы переведены в основной состав!",
                    Message = $"Освободилось место на «{game.Title}». Вы автоматически переведены из очереди в основной состав!",
                    GameId = game.Id
                });

                message = $"Запись отменена. Игрок {promotedUser.FirstName} {promotedUser.LastName} продвинут из очереди в основной состав!";
            }
            else
            {
                game.Status = GameStatus.Open;
            }
        }
        else
        {
            // Left from Waitlist -> re-index remaining
            var remaining = game.Participants
                .Where(p => p.Status == ParticipantStatus.Waitlist)
                .OrderBy(p => p.QueuePosition ?? 999)
                .ToList();

            for (int i = 0; i < remaining.Count; i++)
            {
                remaining[i].QueuePosition = i + 1;
            }
        }

        game.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        UserDto? promotedDto = promotedUser != null ? new UserDto(
            promotedUser.Id, promotedUser.Email, promotedUser.FirstName, promotedUser.LastName,
            promotedUser.AvatarUrl, promotedUser.Phone, promotedUser.CityId, null, new List<string> { "User" },
            promotedUser.Status.ToString(), promotedUser.CreatedAt, new UserStatsDto(0, 0, 0, 0, 5.0, 0)
        ) : null;

        return new LeaveGameResultDto(MapToDto(game), promotedDto, message);
    }

    private static GameDto MapToDto(Game g)
    {
        var main = g.Participants.Count(p => p.Status == ParticipantStatus.Main);
        var wait = g.Participants.Count(p => p.Status == ParticipantStatus.Waitlist);

        return new GameDto(
            g.Id, g.TemplateId, g.OrganizerId,
            $"{g.Organizer.FirstName} {g.Organizer.LastName}",
            g.Organizer.AvatarUrl, 4.9,
            g.SportId, g.Sport.Name,
            g.LevelId, g.Level.Name,
            g.Title, g.VenueId, g.Venue.Name, g.Venue.Address,
            g.Venue.Latitude, g.Venue.Longitude,
            g.StartDateTime, g.EndDateTime, g.TimeZone,
            g.MaxPlayers, g.PriceKopecks, g.Description, g.Rules,
            g.CancellationDeadlineHours, g.Status, main, wait,
            g.Participants.Select(p => MapParticipantToDto(p, p.User)).ToList()
        );
    }

    private static GameParticipantDto MapParticipantToDto(GameParticipant p, User u)
    {
        return new GameParticipantDto(
            p.Id, u.Id, u.FirstName, u.LastName, u.AvatarUrl,
            5.0, p.Status, p.QueuePosition, p.JoinedAt
        );
    }
}

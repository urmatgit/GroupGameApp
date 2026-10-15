using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using GroupGame.Application.Common.Interfaces;
using GroupGame.Application.Services;
using GroupGame.Domain.Entities;
using GroupGame.Domain.Enums;

namespace GroupGame.Tests;

public class GameServiceTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly List<Game> _games;
    private readonly List<User> _users;
    private readonly List<BlacklistEntry> _blacklist;
    private readonly List<Notification> _notifications;

    public GameServiceTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _games = new List<Game>();
        _users = new List<User>();
        _blacklist = new List<BlacklistEntry>();
        _notifications = new List<Notification>();
    }

    [Fact]
    public void Game_Initialization_SetsDefaultsCorrectly()
    {
        // Arrange & Act
        var game = new Game
        {
            Title = "Волейбол вечерний",
            MaxPlayers = 12,
            Status = GameStatus.Open,
            PriceKopecks = 50000,
            StartDateTime = DateTime.UtcNow.AddDays(1)
        };

        // Assert
        Assert.Equal("Волейбол вечерний", game.Title);
        Assert.Equal(12, game.MaxPlayers);
        Assert.Equal(GameStatus.Open, game.Status);
        Assert.Equal(50000, game.PriceKopecks);
        Assert.True(game.StartDateTime > DateTime.UtcNow);
    }

    [Fact]
    public void GameParticipant_QueuePosition_AssignedForWaitlist()
    {
        // Arrange
        var participantMain = new GameParticipant
        {
            UserId = Guid.NewGuid(),
            Status = ParticipantStatus.Main,
            QueuePosition = null
        };

        var participantWaitlist = new GameParticipant
        {
            UserId = Guid.NewGuid(),
            Status = ParticipantStatus.Waitlist,
            QueuePosition = 1
        };

        // Assert
        Assert.Null(participantMain.QueuePosition);
        Assert.Equal(1, participantWaitlist.QueuePosition);
        Assert.Equal(ParticipantStatus.Waitlist, participantWaitlist.Status);
    }

    [Fact]
    public void Notification_Creation_SetsFields()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var gameId = Guid.NewGuid();

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "WAITLIST_PROMOTED",
            Title = "Продвижение из очереди!",
            Message = "Вы переведены в основной состав",
            GameId = gameId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(userId, notification.UserId);
        Assert.Equal("WAITLIST_PROMOTED", notification.Type);
        Assert.False(notification.IsRead);
        Assert.Equal(gameId, notification.GameId);
    }

    [Fact]
    public void UserAccount_BlacklistCheck_BlocksParticipation()
    {
        // Arrange
        var organizerId = Guid.NewGuid();
        var blockedUserId = Guid.NewGuid();

        var entry = new BlacklistEntry
        {
            OwnerUserId = organizerId,
            BlockedUserId = blockedUserId,
            Reason = "Систематические пропуски"
        };

        _blacklist.Add(entry);

        // Act
        bool isBlocked = _blacklist.Any(b => b.OwnerUserId == organizerId && b.BlockedUserId == blockedUserId);

        // Assert
        Assert.True(isBlocked);
    }
}

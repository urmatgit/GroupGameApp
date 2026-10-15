using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;
using GroupGame.Domain.Entities;
using GroupGame.Domain.Enums;

namespace GroupGame.Tests;

public class NotificationServiceTests
{
    [Fact]
    public void WaitlistAdvancement_CalculatesNewPositions()
    {
        // Arrange
        var game = new Game { MaxPlayers = 2, Status = GameStatus.Full };
        var p1 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Main };
        var p2 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Main };
        var w1 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Waitlist, QueuePosition = 1 };
        var w2 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Waitlist, QueuePosition = 2 };
        var w3 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Waitlist, QueuePosition = 3 };

        game.Participants.Add(p1);
        game.Participants.Add(p2);
        game.Participants.Add(w1);
        game.Participants.Add(w2);
        game.Participants.Add(w3);

        // Act - w1 leaves from waitlist
        w1.Status = ParticipantStatus.Cancelled;

        var remainingWaitlist = game.Participants
            .Where(p => p.Status == ParticipantStatus.Waitlist)
            .OrderBy(p => p.QueuePosition ?? 999)
            .ToList();

        for (int i = 0; i < remainingWaitlist.Count; i++)
        {
            remainingWaitlist[i].QueuePosition = i + 1;
        }

        // Assert
        Assert.Equal(1, w2.QueuePosition);
        Assert.Equal(2, w3.QueuePosition);
    }

    [Fact]
    public void StatusChangedNotification_FilterByUserId()
    {
        // Arrange
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();

        var list = new List<Notification>
        {
            new Notification { Id = Guid.NewGuid(), UserId = user1, Type = "STATUS_CHANGED", Title = "Статус 1" },
            new Notification { Id = Guid.NewGuid(), UserId = user1, Type = "WAITLIST_PROMOTED", Title = "Продвинут" },
            new Notification { Id = Guid.NewGuid(), UserId = user2, Type = "GAME_CANCELLED", Title = "Отмена" }
        };

        // Act
        var user1Notifs = list.Where(n => n.UserId == user1).ToList();

        // Assert
        Assert.Equal(2, user1Notifs.Count);
        Assert.All(user1Notifs, n => Assert.Equal(user1, n.UserId));
    }
}

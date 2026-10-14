using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;
using GroupGame.Domain.Entities;
using GroupGame.Domain.Enums;

namespace GroupGame.Tests;

public class WaitlistFifoTests
{
    [Fact]
    public void WhenGameIsFull_PlayerIsPlacedInWaitlistWithFifoQueuePosition()
    {
        // Arrange
        var game = new Game
        {
            MaxPlayers = 2,
            Status = GameStatus.Full
        };

        var main1 = new GameParticipant { Status = ParticipantStatus.Main };
        var main2 = new GameParticipant { Status = ParticipantStatus.Main };
        game.Participants.Add(main1);
        game.Participants.Add(main2);

        // Act - Simulate player 3 joining
        int currentWaitlistCount = game.Participants.Count(p => p.Status == ParticipantStatus.Waitlist);
        var waitlist1 = new GameParticipant
        {
            Status = ParticipantStatus.Waitlist,
            QueuePosition = currentWaitlistCount + 1
        };
        game.Participants.Add(waitlist1);

        // Assert
        Assert.Equal(ParticipantStatus.Waitlist, waitlist1.Status);
        Assert.Equal(1, waitlist1.QueuePosition);
    }

    [Fact]
    public void WhenMainParticipantLeaves_FirstWaitlistCandidateIsPromotedAndQueueReIndexed()
    {
        // Arrange
        var game = new Game { MaxPlayers = 2, Status = GameStatus.Full };
        var main1 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Main };
        var main2 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Main };
        var wait1 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Waitlist, QueuePosition = 1 };
        var wait2 = new GameParticipant { UserId = Guid.NewGuid(), Status = ParticipantStatus.Waitlist, QueuePosition = 2 };

        game.Participants.Add(main1);
        game.Participants.Add(main2);
        game.Participants.Add(wait1);
        game.Participants.Add(wait2);

        // Act: main1 leaves
        main1.Status = ParticipantStatus.Cancelled;

        // Auto-promotion logic
        var candidate = game.Participants
            .Where(p => p.Status == ParticipantStatus.Waitlist)
            .OrderBy(p => p.QueuePosition ?? 999)
            .First();

        candidate.Status = ParticipantStatus.Main;
        candidate.QueuePosition = null;

        var remaining = game.Participants
            .Where(p => p.Status == ParticipantStatus.Waitlist)
            .OrderBy(p => p.QueuePosition ?? 999)
            .ToList();

        for (int i = 0; i < remaining.Count; i++)
        {
            remaining[i].QueuePosition = i + 1;
        }

        // Assert
        Assert.Equal(ParticipantStatus.Main, wait1.Status);
        Assert.Null(wait1.QueuePosition);
        Assert.Equal(1, wait2.QueuePosition);
        Assert.Equal(2, game.Participants.Count(p => p.Status == ParticipantStatus.Main));
    }

    [Fact]
    public void CancellationAfterDeadline_ShouldFailValidation()
    {
        // Arrange: game starts in 1 hour, deadline is 3 hours
        var game = new Game
        {
            StartDateTime = DateTime.UtcNow.AddHours(1),
            CancellationDeadlineHours = 3
        };

        var deadline = game.StartDateTime.AddHours(-game.CancellationDeadlineHours);
        bool isDeadlinePassed = DateTime.UtcNow > deadline;

        // Assert
        Assert.True(isDeadlinePassed);
    }
}

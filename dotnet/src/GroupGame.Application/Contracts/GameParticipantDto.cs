using System;
using GroupGame.Domain.Enums;

namespace GroupGame.Application.Contracts;

public record GameParticipantDto(
    Guid Id,
    Guid UserId,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    double Rating,
    ParticipantStatus Status,
    int? QueuePosition,
    DateTime JoinedAt
);

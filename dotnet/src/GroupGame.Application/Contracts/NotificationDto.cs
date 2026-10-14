using System;

namespace GroupGame.Application.Contracts;

public record NotificationDto(
    Guid Id,
    Guid UserId,
    string Type,
    string Title,
    string Message,
    Guid? GameId,
    bool IsRead,
    DateTime CreatedAt
);

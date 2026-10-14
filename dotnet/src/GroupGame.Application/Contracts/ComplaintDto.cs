using System;
using GroupGame.Domain.Enums;

namespace GroupGame.Application.Contracts;

public record ComplaintDto(
    Guid Id,
    Guid FromUserId,
    string FromUserName,
    Guid? TargetUserId,
    string? TargetUserName,
    Guid? GameId,
    string? GameTitle,
    string Reason,
    string Description,
    ComplaintStatus Status,
    DateTime CreatedAt
);

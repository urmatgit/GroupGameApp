using System;
using GroupGame.Domain.Enums;

namespace GroupGame.Application.Contracts;

public record AttendanceDto(
    Guid Id,
    Guid GameId,
    Guid UserId,
    string UserName,
    AttendanceStatus Status,
    DateTime MarkedAt
);

using System;

namespace GroupGame.Application.Contracts;

public record RatingDto(
    Guid Id,
    Guid GameId,
    Guid FromUserId,
    string FromUserName,
    Guid ToUserId,
    int Stars,
    string? ReviewText,
    DateTime CreatedAt
);

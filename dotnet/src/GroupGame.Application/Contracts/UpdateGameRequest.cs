using System;
using GroupGame.Domain.Enums;

namespace GroupGame.Application.Contracts;

public record UpdateGameRequest(
    string? Title,
    string? Description,
    string? Rules,
    int? PriceKopecks,
    int? MaxPlayers,
    int? CancellationDeadlineHours,
    GameStatus? Status
);

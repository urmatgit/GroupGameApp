namespace GroupGame.Application.Contracts;

public record UserStatsDto(
    int GamesOrganized,
    int GamesPlayed,
    int AttendedCount,
    int NoShowCount,
    double Rating,
    int RatingsCount
);

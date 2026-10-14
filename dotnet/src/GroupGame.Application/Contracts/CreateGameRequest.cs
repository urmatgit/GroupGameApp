using System;

namespace GroupGame.Application.Contracts;

public record CreateGameRequest(
    Guid SportId,
    Guid LevelId,
    Guid VenueId,
    string Title,
    DateTime StartDateTime,
    DateTime EndDateTime,
    string TimeZone,
    int MaxPlayers,
    int PriceKopecks,
    string Description,
    string Rules,
    int CancellationDeadlineHours,
    Guid? TemplateId
);

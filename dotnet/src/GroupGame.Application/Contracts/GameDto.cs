using System;
using System.Collections.Generic;
using GroupGame.Domain.Enums;

namespace GroupGame.Application.Contracts;

public record GameDto(
    Guid Id,
    Guid? TemplateId,
    Guid OrganizerId,
    string OrganizerName,
    string? OrganizerAvatarUrl,
    double OrganizerRating,
    Guid SportId,
    string SportName,
    Guid LevelId,
    string LevelName,
    string Title,
    Guid VenueId,
    string VenueName,
    string VenueAddress,
    double? Latitude,
    double? Longitude,
    DateTime StartDateTime,
    DateTime EndDateTime,
    string TimeZone,
    int MaxPlayers,
    int PriceKopecks,
    string Description,
    string Rules,
    int CancellationDeadlineHours,
    GameStatus Status,
    int MainCount,
    int WaitlistCount,
    List<GameParticipantDto> Participants
);

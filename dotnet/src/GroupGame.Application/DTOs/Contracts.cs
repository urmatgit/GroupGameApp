using System;
using System.Collections.Generic;
using GroupGame.Domain.Enums;

namespace GroupGame.Application.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    string? Phone,
    Guid? CityId,
    string? CityName,
    List<string> Roles,
    string Status,
    DateTime CreatedAt,
    UserStatsDto Stats
);

public record UserStatsDto(
    int GamesOrganized,
    int GamesPlayed,
    int AttendedCount,
    int NoShowCount,
    double Rating,
    int RatingsCount
);

public record AuthResponseDto(
    string Token,
    string RefreshToken,
    UserDto User
);

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string FirstName, string LastName, string Phone, Guid CityId);

public record GameFilterRequest(
    Guid? SportId,
    Guid? LevelId,
    string? Status,
    bool FreeOnly,
    bool AvailableOnly,
    string? SearchQuery,
    int Page = 1,
    int PageSize = 20
);

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

public record JoinGameResultDto(
    GameDto Game,
    GameParticipantDto Participant,
    string Message
);

public record LeaveGameRequest(string? Reason, bool Force = false);

public record LeaveGameResultDto(
    GameDto Game,
    UserDto? PromotedUser,
    string Message
);

public record AttendanceRecordRequest(Guid UserId, AttendanceStatus Status);
public record MarkAttendanceRequest(List<AttendanceRecordRequest> Records);

public record CreateRatingRequest(Guid ToUserId, int Stars, string? ReviewText);

public record CreateComplaintRequest(Guid? TargetUserId, Guid? GameId, string Reason, string Description);

public record ProblemDetailsDto(
    string Type,
    string Title,
    int Status,
    string Detail,
    string Instance,
    Dictionary<string, string[]>? Errors = null
);

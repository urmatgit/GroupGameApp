using System;
using System.Collections.Generic;

namespace GroupGame.Application.Contracts;

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

using System;

namespace GroupGame.Application.Contracts;

public record UpdateUserRequest(
    string? FirstName,
    string? LastName,
    string? Phone,
    string? AvatarUrl,
    Guid? CityId
);

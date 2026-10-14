using System;

namespace GroupGame.Application.Contracts;

public record CityDto(
    Guid Id,
    string Name,
    string Country
);

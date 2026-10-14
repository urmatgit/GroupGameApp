using System;

namespace GroupGame.Application.Contracts;

public record UserSportDto(
    Guid SportId,
    string SportName,
    Guid LevelId,
    string LevelName
);

using System;

namespace GroupGame.Application.Contracts;

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

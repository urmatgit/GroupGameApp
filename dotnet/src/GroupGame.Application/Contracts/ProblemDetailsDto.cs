using System.Collections.Generic;

namespace GroupGame.Application.Contracts;

public record ProblemDetailsDto(
    string Type,
    string Title,
    int Status,
    string Detail,
    string Instance,
    Dictionary<string, string[]>? Errors = null
);

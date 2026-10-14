using System;

namespace GroupGame.Application.Contracts;

public record CreateRatingRequest(Guid ToUserId, int Stars, string? ReviewText);

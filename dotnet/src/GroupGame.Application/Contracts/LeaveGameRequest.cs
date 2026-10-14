namespace GroupGame.Application.Contracts;

public record LeaveGameRequest(string? Reason, bool Force = false);

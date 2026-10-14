namespace GroupGame.Application.Contracts;

public record ChangePasswordRequest(string OldPassword, string NewPassword);

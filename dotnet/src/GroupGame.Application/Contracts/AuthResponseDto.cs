namespace GroupGame.Application.Contracts;

public record AuthResponseDto(
    string Token,
    string RefreshToken,
    UserDto User
);

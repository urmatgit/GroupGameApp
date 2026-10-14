namespace GroupGame.Application.Contracts;

public record LeaveGameResultDto(
    GameDto Game,
    UserDto? PromotedUser,
    string Message
);

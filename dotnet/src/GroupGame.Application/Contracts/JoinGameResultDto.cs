namespace GroupGame.Application.Contracts;

public record JoinGameResultDto(
    GameDto Game,
    GameParticipantDto Participant,
    string Message
);

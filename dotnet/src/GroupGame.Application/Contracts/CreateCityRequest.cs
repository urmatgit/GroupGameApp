namespace GroupGame.Application.Contracts;

public record CreateCityRequest(
    string Name,
    string Country = "Россия"
);

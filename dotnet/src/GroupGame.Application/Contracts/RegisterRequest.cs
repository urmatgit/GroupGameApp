using System;

namespace GroupGame.Application.Contracts;

public record RegisterRequest(string Email, string Password, string FirstName, string LastName, string Phone, Guid CityId);

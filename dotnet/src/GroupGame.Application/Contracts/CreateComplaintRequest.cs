using System;

namespace GroupGame.Application.Contracts;

public record CreateComplaintRequest(Guid? TargetUserId, Guid? GameId, string Reason, string Description);

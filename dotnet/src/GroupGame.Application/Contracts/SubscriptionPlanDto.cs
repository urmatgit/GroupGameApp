using System;
using System.Collections.Generic;

namespace GroupGame.Application.Contracts;

public record SubscriptionPlanDto(
    Guid Id,
    string Name,
    int PriceKopecks,
    string Period,
    string Description,
    List<string> Entitlements
);

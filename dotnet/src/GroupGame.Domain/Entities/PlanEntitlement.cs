using System;

namespace GroupGame.Domain.Entities;

public class PlanEntitlement
{
    public Guid PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;
    public Guid EntitlementId { get; set; }
    public Entitlement Entitlement { get; set; } = null!;
}

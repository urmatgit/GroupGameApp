using System;
using System.Collections.Generic;

namespace GroupGame.Domain.Entities;

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int PriceKopecks { get; set; } = 0;
    public string Period { get; set; } = "month";
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<PlanEntitlement> PlanEntitlements { get; set; } = new List<PlanEntitlement>();
}

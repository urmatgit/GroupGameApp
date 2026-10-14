using System;

namespace GroupGame.Domain.Entities;

public class SubscriptionUsage : BaseEntity
{
    public Guid SubscriptionId { get; set; }
    public string EntitlementCode { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

using System;

namespace LoyaltyManagementSystem.Model
{
    public class TierBasedRequirement
    {
        public int Id { get; set; }
        public string Tier { get; set; } = string.Empty;
        public int PointsRequired { get; set; }
        public string DynamicRule { get; set; } = string.Empty;
    }
}
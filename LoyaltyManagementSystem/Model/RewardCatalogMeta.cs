using System;

namespace LoyaltyManagementSystem.Model
{
    public class RewardCatalogMeta
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; }
        public int RequiredPoints { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }

    }
}
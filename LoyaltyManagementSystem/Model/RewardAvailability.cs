using System;

namespace LoyaltyManagementSystem.Model
{
    public class RewardAvailability
    {
        public int Id { get; set; }
        public string Reward { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Inventory { get; set; }
        public bool LowInventoryAlert { get; set; }
        public bool ManualOverride { get; set; }
    }
}
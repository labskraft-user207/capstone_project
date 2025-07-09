using System;

namespace LoyaltyManagementSystem.Model
{
    public class RulesPromotion
    {
        public int Id { get; set; }
        public string PromotionName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Multiplier { get; set; }
    }
}
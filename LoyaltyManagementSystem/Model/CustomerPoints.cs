using System;

namespace LoyaltyManagementSystem.Model
{
    public class CustomerPoints
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string PointType { get; set; } = string.Empty;
        public string UserTier { get; set; } = string.Empty;
        public DateTime PointGainedOn { get; set; }
        public int PointGained { get; set; }
    }
}
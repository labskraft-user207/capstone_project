using System;

namespace LoyaltyManagementSystem.Model
{
    public class UserPointsOrderHistory
    {
        public int OrderId { get; set; }
        public int? UserId { get; set; }
        public string PointType { get; set; } = string.Empty;
        public int? OrderValue { get; set; }
        public DateTime? PointGainedOn { get; set; }
        public int? PointGained { get; set; }
        public string? Item { get; set; }
        public string? Logic { get; set; }
        public int? ReviewId { get; set; }
        public string? ReferredUserMailId { get; set; }
    }
}
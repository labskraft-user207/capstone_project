using System;

namespace LoyaltyManagementSystem.Model
{
    public class RulesByActivity
    {
        public int Id { get; set; }
        public string PointsType { get; set; } = string.Empty;
        public int Points { get; set; }
        public int PointPer { get; set; }
        public int Limits { get; set; }
        public decimal Multiplier { get; set; }
    }
}
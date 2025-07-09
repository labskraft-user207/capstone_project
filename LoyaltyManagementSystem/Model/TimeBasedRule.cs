using System;

namespace LoyaltyManagementSystem.Model
{
    public class TimeBasedRule
    {
        public int Id { get; set; }
        public string EventName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int PointAdjustments { get; set; }
    }
}
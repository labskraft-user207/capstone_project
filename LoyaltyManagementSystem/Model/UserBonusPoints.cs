using System;

namespace LoyaltyManagementSystem.Model
{
    public class UserBonusPoints
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BonusPoints { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string AssociatedActivity { get; set; } = string.Empty;
        public DateTime ExpirationDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
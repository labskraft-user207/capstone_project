using System;

namespace LoyaltyManagementSystem.Model
{
    public class UserCatalogWishManageList
    {
        public int Id { get; set; }
        public string RewardName { get; set; } = string.Empty;
        public string RewardType { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int PointsRequired { get; set; }
        public int InventoryQuality { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
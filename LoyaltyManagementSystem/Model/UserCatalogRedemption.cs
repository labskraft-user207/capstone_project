using System;

namespace LoyaltyManagementSystem.Model
{
    public class UserCatalogRedemption
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? CatalogId { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
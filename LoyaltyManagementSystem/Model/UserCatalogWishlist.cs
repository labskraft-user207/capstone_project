namespace LoyaltyManagementSystem.Model
{
    public class UserCatalogWishlist
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? CatalogId { get; set; }
    }
}
namespace LoyaltyManagementSystem.Model
{
    public class AlertEmailRequest
    {
        public string? AlertType { get; set; }
        public string? AlertContent { get; set; }
        public string? AlertSubject { get; set; }
        public string? AlertBody { get; set; }
        public string? From { get; set; }
        public string To { get; set; } = string.Empty;
    }
}
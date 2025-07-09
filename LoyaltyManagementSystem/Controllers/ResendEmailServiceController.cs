using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using LoyaltyManagementSystem.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ResendEmailServiceController : ControllerBase
    {
        private readonly ResendConfiguration _resendConfig;
        private readonly ILogger<ResendEmailServiceController> _logger;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ResendEmailServiceController(
            IOptions<ResendConfiguration> resendConfig,
            ILogger<ResendEmailServiceController> logger,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _resendConfig = resendConfig.Value;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient(nameof(ResendEmailServiceController));
            _configuration = configuration;

            // Read API key from configuration (appsettings.json or environment)
            var apiKey = _configuration["ResendConfiguration:ApiKey"] ?? _resendConfig.ApiKey;
            _httpClient.BaseAddress = new Uri("https://api.resend.com/");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        }

        private bool IsEmailEnabled =>
            (_configuration.GetValue<bool>("ResendConfiguration:EnableEmail") || _resendConfig.EnableEmail)
            && !string.IsNullOrEmpty(_configuration["ResendConfiguration:ApiKey"] ?? _resendConfig.ApiKey);

        // POST: /ResendEmailService/SendAlertfromClient
        [HttpPost("SendAlertfromClient")]
        public async Task<IActionResult> SendAlertfromClient([FromBody] AlertEmailRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.To) ||
                string.IsNullOrWhiteSpace(request.AlertSubject) || string.IsNullOrWhiteSpace(request.AlertBody))
            {
                return BadRequest("To, AlertSubject, and AlertBody are required.");
            }

            if (!IsEmailEnabled)
            {
                _logger.LogWarning("Resend email sending is disabled. Would have sent: {Subject} to {Email}", request.AlertSubject, request.To);
                return Ok("Email sending is disabled.");
            }

            var emailRequest = new
            {
                from = request.From ?? $"{_resendConfig.FromName} <{_resendConfig.FromEmail}>",
                to = new[] { request.To },
                subject = request.AlertSubject,
                html = ConvertToHtml(request.AlertBody),
                text = request.AlertBody
            };

            var json = JsonSerializer.Serialize(emailRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation("📧 Sending alert email via Resend to {Email} with subject: {Subject}", request.To, request.AlertSubject);

            var response = await _httpClient.PostAsync("emails", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("✅ Alert email sent successfully via Resend to {Email}", request.To);
                return Ok(new
                {
                    success = true,
                    message = "Alert email sent successfully.",
                    alertType = request.AlertType,
                    alertContent = request.AlertContent
                });
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ Failed to send alert email via Resend to {Email}. Status: {Status}, Error: {Error}",
                    request.To, response.StatusCode, errorContent);
                return StatusCode((int)response.StatusCode, new
                {
                    success = false,
                    message = "Failed to send alert email.",
                    error = errorContent
                });
            }
        }

        // POST: /ResendEmailService/SendDynamicEmailWithAttachment
        [HttpPost("SendDynamicEmailWithAttachment")]
        public async Task<IActionResult> SendDynamicEmailWithAttachment([FromForm] DynamicEmailRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.To) ||
                string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Body))
            {
                return BadRequest("To, Subject, and Body are required.");
            }

            if (!IsEmailEnabled)
            {
                _logger.LogWarning("Resend email sending is disabled. Would have sent: {Subject} to {Email}", request.Subject, request.To);
                return Ok("Email sending is disabled.");
            }

            // Construct HTML and text dynamically
            string htmlBody = !string.IsNullOrWhiteSpace(request.Html)
                ? request.Html
                : $"<p>{System.Net.WebUtility.HtmlEncode(request.Body)}</p>";

            string textBody = request.Body;

            // Prepare multipart form data for attachments
            using var form = new MultipartFormDataContent();
            form.Add(new StringContent(request.From ?? $"{_resendConfig.FromName} <{_resendConfig.FromEmail}>"), "from");
            form.Add(new StringContent(request.To), "to");
            form.Add(new StringContent(request.Subject), "subject");
            form.Add(new StringContent(htmlBody), "html");
            form.Add(new StringContent(textBody), "text");

            if (request.Attachments != null && request.Attachments.Count > 0)
            {
                foreach (var file in request.Attachments)
                {
                    if (file.Length > 0)
                    {
                        var streamContent = new StreamContent(file.OpenReadStream());
                        streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                        form.Add(streamContent, "attachments", file.FileName);
                    }
                }
            }

            _logger.LogInformation("📧 Sending dynamic email via Resend to {Email} with subject: {Subject}", request.To, request.Subject);

            var response = await _httpClient.PostAsync("emails", form);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("✅ Dynamic email sent successfully via Resend to {Email}", request.To);
                return Ok(new
                {
                    success = true,
                    message = "Dynamic email sent successfully.",
                    to = request.To,
                    subject = request.Subject
                });
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ Failed to send dynamic email via Resend to {Email}. Status: {Status}, Error: {Error}",
                    request.To, response.StatusCode, errorContent);
                return StatusCode((int)response.StatusCode, new
                {
                    success = false,
                    message = "Failed to send dynamic email.",
                    error = errorContent
                });
            }
        }

        // POST: /ResendEmailService/SendDynamicEmail
        [HttpPost("SendDynamicEmail")]
        public async Task<IActionResult> SendDynamicEmail([FromBody] DynamicEmailRequestwithoutattachments request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.To) ||
                string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Body))
            {
                return BadRequest("To, Subject, and Body are required.");
            }

            if (!IsEmailEnabled)
            {
                _logger.LogWarning("Resend email sending is disabled. Would have sent: {Subject} to {Email}", request.Subject, request.To);
                return Ok("Email sending is disabled.");
            }

            // Construct HTML and text dynamically
            string htmlBody = !string.IsNullOrWhiteSpace(request.Html)
                ? request.Html
                : $"<p>{System.Net.WebUtility.HtmlEncode(request.Body)}</p>";

            string textBody = request.Body;

            var emailRequest = new
            {
                from = request.From ?? $"{_resendConfig.FromName} <{_resendConfig.FromEmail}>",
                to = new[] { request.To },
                subject = request.Subject,
                html = htmlBody,
                text = textBody
            };

            var json = JsonSerializer.Serialize(emailRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation("📧 Sending dynamic email via Resend to {Email} with subject: {Subject}", request.To, request.Subject);

            var response = await _httpClient.PostAsync("emails", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("✅ Dynamic email sent successfully via Resend to {Email}", request.To);
                return Ok(new
                {
                    success = true,
                    message = "Dynamic email sent successfully.",
                    to = request.To,
                    subject = request.Subject
                });
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ Failed to send dynamic email via Resend to {Email}. Status: {Status}, Error: {Error}",
                    request.To, response.StatusCode, errorContent);
                return StatusCode((int)response.StatusCode, new
                {
                    success = false,
                    message = "Failed to send dynamic email.",
                    error = errorContent
                });
            }
        }

            private string ConvertToHtml(string text) => $"<p>{System.Net.WebUtility.HtmlEncode(text)}</p>";
    }

    // Example configuration and DTOs
    public class ResendConfiguration
    {
        public string ApiKey { get; set; } = string.Empty;
        public string FromName { get; set; } = "YourApp";
        public string FromEmail { get; set; } = "onboarding@resend.dev";
        public bool EnableEmail { get; set; } = true;
    }

    public class DynamicEmailRequest
    {
        public string? From { get; set; }
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Html { get; set; }
        public List<IFormFile>? Attachments { get; set; }
    }

    public class DynamicEmailRequestwithoutattachments
    {
        public string? From { get; set; }
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Html { get; set; }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Resend;
using LoyaltyManagementSystem.Model;
using System.Net;
using System.Net.Mail;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommonController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<CommonController> _logger;
        private readonly IResend _resend;

        public CommonController(IConfiguration configuration, ILogger<CommonController> logger, IResend resend)
        {
            _configuration = configuration;
            _logger = logger;
            _resend = resend;
        }

        // POST: /Common/SendEmailSmtp
        [HttpPost("SendEmailSmtp")]
        public async Task<IActionResult> SendEmailSmtp([FromBody] EmailRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Html))
                return BadRequest("To, Subject, and Html are required.");

            var message = new EmailMessage
            {
                From = request.From ?? "Acme <onboarding@resend.dev>",
                Subject = request.Subject,
                HtmlBody = request.Html
            };
            message.To.Add(request.To);

            await _resend.EmailSendAsync(message);
            return Ok(new { success = true, message = "Email sent successfully." });
        }

        // POST: /Common/SendEmailResendSample
        [HttpPost("SendEmailResendSample")]
        public async Task<IActionResult> SendEmailResendSample()
        {
            var message = new EmailMessage
            {
                From = "Acme <onboarding@resend.dev>",
                Subject = "hello world",
                HtmlBody = "<p>it works!</p>"
            };
            message.To.Add("delivered@resend.dev");

            await _resend.EmailSendAsync(message);
            return Ok(new { success = true, message = "Sample email sent successfully." });
        }

        // POST: /Common/SendAlertEmail
        [HttpPost("SendAlertEmail")]
        public async Task<IActionResult> SendAlertEmail([FromBody] AlertEmailRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.AlertSubject) || string.IsNullOrWhiteSpace(request.AlertBody))
                return BadRequest("To, AlertSubject, and AlertBody are required.");

            var message = new EmailMessage
            {
                From = request.From ?? "Acme <onboarding@resend.dev>",
                Subject = request.AlertSubject,
                HtmlBody = request.AlertBody
            };
            message.To.Add(request.To);

            await _resend.EmailSendAsync(message);
            return Ok(new
            {
                success = true,
                message = "Alert email sent successfully.",
                alertType = request.AlertType,
                alertContent = request.AlertContent
            });
        }
    }

    public class EmailRequest
    {
        public string? From { get; set; }
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Html { get; set; } = string.Empty;
    }
}
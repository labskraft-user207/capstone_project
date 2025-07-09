using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;

namespace LoyaltyManagementSystem.Controllers
{
    public class ResendEmailController : Controller
    {
        private static readonly HttpClient httpClient = new HttpClient();

        public async Task SendEmail()
        {
            string apiKey = "re_iDYuuR1v_7NyYWQ43aRyGAJLrntaASsJx"; // 🔐 Use your actual Resend API key
            string senderEmail = "onboarding@resend.dev";   // must be verified on Resend
            string toEmail = "user207@labskraft.com";    // receiver's email

            var emailBody = new
            {
                from = senderEmail,
                to = toEmail,
                subject = "Hello from Resend",
                html = "<strong>This is a test email sent using Resend API</strong>"
            };

            string json = System.Text.Json.JsonSerializer.Serialize(emailBody);

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            HttpResponseMessage response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("✅ Email sent successfully!");
            }
            else
            {
                string error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"❌ Failed: {response.StatusCode}\n{error}");
            }
        }
    }
}

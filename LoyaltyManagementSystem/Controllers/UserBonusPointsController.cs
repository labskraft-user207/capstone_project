using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using LoyaltyManagementSystem.Model;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserBonusPointsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public UserBonusPointsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET: /UserBonusPoints
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                SELECT b.Id, b.UserId, b.BonusPoints, b.Reason, b.AssociatedActivity, b.ExpirationDate, b.Status, a.EmailId
                FROM [dbo].[LMuserbonusPoints] b
                LEFT JOIN [dbo].[LMUserAdditionalDetails] a ON b.UserId = a.UserId";

            var result = await connection.QueryAsync<UserBonusPointsWithEmail>(sql);
            return Ok(result.ToList());
        }

        // POST: /UserBonusPoints
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserBonusPoints model)
        {
            if (model == null)
                return BadRequest("Model cannot be null.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                INSERT INTO [dbo].[LMuserbonusPoints]
                (UserId, BonusPoints, Reason, AssociatedActivity, ExpirationDate, Status)
                VALUES (@UserId, @BonusPoints, @Reason, @AssociatedActivity, @ExpirationDate, @Status);
                SELECT CAST(SCOPE_IDENTITY() as int);";

            var id = await connection.ExecuteScalarAsync<int>(sql, model);
            model.Id = id;
            return CreatedAtAction(nameof(GetAll), new { id = model.Id }, model);
        }
    }

    public class UserBonusPointsWithEmail
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BonusPoints { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string AssociatedActivity { get; set; } = string.Empty;
        public DateTime ExpirationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? EmailId { get; set; }
    }
}
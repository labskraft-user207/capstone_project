using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using LoyaltyManagementSystem.Model;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RulesController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public RulesController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET: /Rules/GetRulesByActivity
        [HttpGet("GetRulesByActivity")]
        public async Task<IActionResult> GetRulesByActivity()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString); 

            const string sql = @"
                SELECT Id, PointsType, Points, PointPer, Limits, Multiplier
                FROM [dbo].[LMRulesbyActivity]";

            var result = await connection.QueryAsync<RulesByActivity>(sql);
            return Ok(result.ToList());
        }

        // GET: /Rules/GetPromotions
        [HttpGet("GetPromotions")]
        public async Task<IActionResult> GetPromotions()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                SELECT Id, PromotionName, StartDate, EndDate, Multiplier
                FROM [dbo].[LMRulesPromotions]";

            var result = await connection.QueryAsync<RulesPromotion>(sql);
            return Ok(result.ToList());
        }

        // POST: /Rules/AddPromotion
        [HttpPost("AddPromotion")]
        public async Task<IActionResult> AddPromotion([FromBody] RulesPromotion model)
        {
            if (model == null)
                return BadRequest("Model cannot be null.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                INSERT INTO [dbo].[LMRulesPromotions]
                (PromotionName, StartDate, EndDate, Multiplier)
                VALUES (@PromotionName, @StartDate, @EndDate, @Multiplier);
                SELECT CAST(SCOPE_IDENTITY() as int);";

            var id = await connection.ExecuteScalarAsync<int>(sql, model);
            model.Id = id;
            return CreatedAtAction(nameof(GetPromotions), new { id = model.Id }, model);
        }

        // DELETE: /Rules/DeletePromotion/{id}
        [HttpDelete("DeletePromotion/{id}")]
        public async Task<IActionResult> DeletePromotion(int id)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"DELETE FROM [dbo].[LMRulesPromotions] WHERE Id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            if (rows == 0)
                return NotFound();
            return NoContent();
        }

        // POST: /Rules/UpdateRulesByActivity
        [HttpPost("UpdateRulesByActivity")]
        public async Task<IActionResult> UpdateRulesByActivity([FromBody] RulesByActivity model)
        {
            if (model == null || model.Id <= 0)
                return BadRequest("Valid Id is required.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                UPDATE [dbo].[LMRulesbyActivity]
                SET PointsType = @PointsType,
                    Points = @Points,
                    PointPer = @PointPer,
                    Limits = @Limits,
                    Multiplier = @Multiplier
                WHERE Id = @Id";

            var rows = await connection.ExecuteAsync(sql, model);
            if (rows == 0)
                return NotFound();

            return Ok(model);
        }
    }
}
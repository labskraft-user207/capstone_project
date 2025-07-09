using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using LoyaltyManagementSystem.Model;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RulesMetaController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public RulesMetaController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET: /RulesMeta/GetAllRulesMeta
        [HttpGet("GetAllRulesMeta")]
        public async Task<IActionResult> GetAllRulesMeta()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            var tierSql = @"SELECT Id, Tier, PointsRequired, DynamicRule FROM [dbo].[LMTierbasedRequirements]";
            var pointRestrictionSql = @"SELECT Id, MinimumPoints, MaximumPoints FROM [dbo].[LMPointRestriction]";
            var timeBasedSql = @"SELECT Id, EventName, StartDate, EndDate, PointAdjustments FROM [dbo].[LMTimebasedRules]";

            var tierRequirement = (await connection.QueryAsync<TierBasedRequirement>(tierSql)).ToList();
            var pointRestriction = await connection.QueryFirstOrDefaultAsync<PointRestriction>(pointRestrictionSql);
            var timeBasedRules = (await connection.QueryAsync<TimeBasedRule>(timeBasedSql)).ToList();

            return Ok(new
            {
                TierBasedRequirements = tierRequirement,
                PointRestrictions = pointRestriction,
                TimeBasedRules = timeBasedRules
            });
        }

        // POST: /RulesMeta/UpdateTierBasedRequirement
        [HttpPost("UpdateTierBasedRequirement")]
        public async Task<IActionResult> UpdateTierBasedRequirement([FromBody] TierBasedRequirement model)
        {
            if (model == null || model.Id <= 0)
                return BadRequest("Valid Id is required.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                UPDATE [dbo].[LMTierbasedRequirements]
                SET Tier = @Tier,
                    PointsRequired = @PointsRequired,
                    DynamicRule = @DynamicRule
                WHERE Id = @Id";

            var rows = await connection.ExecuteAsync(sql, model);
            if (rows == 0)
                return NotFound();

            return Ok(model);
        }

        // POST: /RulesMeta/UpdatePointRestriction
        [HttpPost("UpdatePointRestriction")]
        public async Task<IActionResult> UpdatePointRestriction([FromBody] PointRestriction model)
        {
            if (model == null || model.Id <= 0)
                return BadRequest("Valid Id is required.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                UPDATE [dbo].[LMPointRestriction]
                SET MinimumPoints = @MinimumPoints,
                    MaximumPoints = @MaximumPoints
                WHERE Id = @Id";

            var rows = await connection.ExecuteAsync(sql, model);
            if (rows == 0)
                return NotFound();

            return Ok(model);
        }

        // POST: /RulesMeta/UpsertTimeBasedRule
        [HttpPost("UpsertTimeBasedRule")]
        public async Task<IActionResult> UpsertTimeBasedRule([FromBody] TimeBasedRule model)
        {
            if (model == null)
                return BadRequest("Model cannot be null.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            if (model.Id > 0)
            {
                // Update
                const string updateSql = @"
                    UPDATE [dbo].[LMTimebasedRules]
                    SET EventName = @EventName,
                        StartDate = @StartDate,
                        EndDate = @EndDate,
                        PointAdjustments = @PointAdjustments
                    WHERE Id = @Id";
                var rows = await connection.ExecuteAsync(updateSql, model);
                if (rows == 0)
                    return NotFound();
                return Ok(model);
            }
            else
            {
                // Insert
                const string insertSql = @"
                    INSERT INTO [dbo].[LMTimebasedRules]
                    (EventName, StartDate, EndDate, PointAdjustments)
                    VALUES (@EventName, @StartDate, @EndDate, @PointAdjustments);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
                var id = await connection.ExecuteScalarAsync<int>(insertSql, model);
                model.Id = id;
                return CreatedAtAction(nameof(GetAllRulesMeta), new { id = model.Id }, model);
            }
        }

        // DELETE: /RulesMeta/DeleteTimeBasedRule/{id}
        [HttpDelete("DeleteTimeBasedRule/{id}")]
        public async Task<IActionResult> DeleteTimeBasedRule(int id)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"DELETE FROM [dbo].[LMTimebasedRules] WHERE Id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            if (rows == 0)
                return NotFound();
            return NoContent();
        }
    }
}
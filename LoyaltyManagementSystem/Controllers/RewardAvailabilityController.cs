using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using LoyaltyManagementSystem.Model;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RewardAvailabilityController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public RewardAvailabilityController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET: /RewardAvailability
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"SELECT Id, Reward, Status, StartDate, EndDate, Inventory, LowInventoryAlert, ManualOverride FROM [dbo].[LMRewardAvailability]";
            var result = await connection.QueryAsync<RewardAvailability>(sql);
            return Ok(result.ToList());
        }

        // POST: /RewardAvailability
        [HttpPost]
        public async Task<IActionResult> Upsert([FromBody] RewardAvailability model)
        {
            if (model == null)
                return BadRequest("Model cannot be null.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            if (model.Id > 0)
            {
                // Update existing record
                const string updateSql = @"
                    UPDATE [dbo].[LMRewardAvailability]
                    SET Reward = @Reward,
                        Status = @Status,
                        StartDate = @StartDate,
                        EndDate = @EndDate,
                        Inventory = @Inventory,
                        LowInventoryAlert = @LowInventoryAlert,
                        ManualOverride = @ManualOverride
                    WHERE Id = @Id";

                var rows = await connection.ExecuteAsync(updateSql, model);
                if (rows == 0)
                    return NotFound();

                return Ok(model);
            }
            else
            {
                // Insert new record
                const string insertSql = @"
                    INSERT INTO [dbo].[LMRewardAvailability]
                    (Reward, Status, StartDate, EndDate, Inventory, LowInventoryAlert, ManualOverride)
                    VALUES (@Reward, @Status, @StartDate, @EndDate, @Inventory, @LowInventoryAlert, @ManualOverride);
                    SELECT CAST(SCOPE_IDENTITY() as int);";

                var id = await connection.ExecuteScalarAsync<int>(insertSql, model);
                model.Id = id;
                return CreatedAtAction(nameof(GetAll), new { id = model.Id }, model);
            }
        }
    }
}
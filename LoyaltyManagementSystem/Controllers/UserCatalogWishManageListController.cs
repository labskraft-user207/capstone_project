using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using LoyaltyManagementSystem.Model;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserCatalogWishManageListController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public UserCatalogWishManageListController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET: /UserCatalogWishManageList
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"SELECT * FROM [dbo].[LMUserCatalogwishManagelist]";
            var result = await connection.QueryAsync<UserCatalogWishManageList>(sql);
            return Ok(result.ToList());
        }

        // GET: /UserCatalogWishManageList/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"SELECT * FROM [dbo].[LMUserCatalogwishManagelist] WHERE Id = @Id";
            var item = await connection.QueryFirstOrDefaultAsync<UserCatalogWishManageList>(sql, new { Id = id });
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        //// POST: /UserCatalogWishManageList
        //[HttpPost]
        //public async Task<IActionResult> Create([FromBody] UserCatalogWishManageList model)
        //{
        //    var connectionString = _configuration.GetConnectionString("DefaultConnection");
        //    using var connection = new SqlConnection(connectionString);

        //    const string sql = @"
        //        INSERT INTO [dbo].[LMUserCatalogwishManagelist]
        //        (RewardName, RewardType, Category, Status, Description, ImageUrl, pointsRequired, InventoryQuality, expiryDate)
        //        VALUES (@RewardName, @RewardType, @Category, @Status, @Description, @ImageUrl, @PointsRequired, @InventoryQuality, @ExpiryDate);
        //        SELECT CAST(SCOPE_IDENTITY() as int);";

        //    var id = await connection.ExecuteScalarAsync<int>(sql, model);
        //    model.Id = id;
        //    return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        //}

        [HttpPost("Bulk")]
        public async Task<IActionResult> BulkUpsert([FromBody] List<UserCatalogWishManageList> models)
        {
            if (models == null || !models.Any())
                return BadRequest("List cannot be empty.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string updateSql = @"
        UPDATE [dbo].[LMUserCatalogwishManagelist]
        SET RewardName = @RewardName,
            RewardType = @RewardType,
            Category = @Category,
            Status = @Status,
            Description = @Description,
            ImageUrl = @ImageUrl,
            pointsRequired = @PointsRequired,
            InventoryQuality = @InventoryQuality,
            expiryDate = @ExpiryDate
        WHERE Id = @Id";

            const string insertSql = @"
        INSERT INTO [dbo].[LMUserCatalogwishManagelist]
        (RewardName, RewardType, Category, Status, Description, ImageUrl, pointsRequired, InventoryQuality, expiryDate)
        VALUES (@RewardName, @RewardType, @Category, @Status, @Description, @ImageUrl, @PointsRequired, @InventoryQuality, @ExpiryDate);
        SELECT CAST(SCOPE_IDENTITY() as int);";

            foreach (var model in models)
            {
                if (model.Id > 0)
                {
                    var rows = await connection.ExecuteAsync(updateSql, model);
                    if (rows == 0)
                    {
                        // If update fails (no record), insert as new
                        var id = await connection.ExecuteScalarAsync<int>(insertSql, model);
                        model.Id = id;
                    }
                }
                else
                {
                    var id = await connection.ExecuteScalarAsync<int>(insertSql, model);
                    model.Id = id;
                }
            }
            return Ok(models);
        }

        // PUT: /UserCatalogWishManageList/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserCatalogWishManageList model)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                UPDATE [dbo].[LMUserCatalogwishManagelist]
                SET RewardName = @RewardName,
                    RewardType = @RewardType,
                    Category = @Category,
                    Status = @Status,
                    Description = @Description,
                    ImageUrl = @ImageUrl,
                    pointsRequired = @PointsRequired,
                    InventoryQuality = @InventoryQuality,
                    expiryDate = @ExpiryDate
                WHERE Id = @Id";

            var rows = await connection.ExecuteAsync(sql, new
            {
                model.RewardName,
                model.RewardType,
                model.Category,
                model.Status,
                model.Description,
                model.ImageUrl,
                model.PointsRequired,
                model.InventoryQuality,
                model.ExpiryDate,
                Id = id
            });

            if (rows == 0)
                return NotFound();

            model.Id = id;
            return Ok(model);
        }

        // POST: /UserCatalogWishManageList
        [HttpPost]
        public async Task<IActionResult> Upsert([FromBody] UserCatalogWishManageList model)
        {
            if (model == null)
                return BadRequest("Model cannot be null.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            if (model.Id > 0)
            {
                // Update existing record
                const string updateSql = @"
                    UPDATE [dbo].[LMUserCatalogwishManagelist]
                    SET RewardName = @RewardName,
                        RewardType = @RewardType,
                        Category = @Category,
                        Status = @Status,
                        Description = @Description,
                        ImageUrl = @ImageUrl,
                        pointsRequired = @PointsRequired,
                        InventoryQuality = @InventoryQuality,
                        expiryDate = @ExpiryDate
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
                    INSERT INTO [dbo].[LMUserCatalogwishManagelist]
                    (RewardName, RewardType, Category, Status, Description, ImageUrl, pointsRequired, InventoryQuality, expiryDate)
                    VALUES (@RewardName, @RewardType, @Category, @Status, @Description, @ImageUrl, @PointsRequired, @InventoryQuality, @ExpiryDate);
                    SELECT CAST(SCOPE_IDENTITY() as int);";

                var id = await connection.ExecuteScalarAsync<int>(insertSql, model);
                model.Id = id;
                return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
            }
        }

        // DELETE: /UserCatalogWishManageList/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"DELETE FROM [dbo].[LMUserCatalogwishManagelist] WHERE Id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            if (rows == 0)
                return NotFound();
            return NoContent();
        }

        // DELETE: /UserCatalogWishManageList/Bulk
        [HttpPost("BulkDelete")]
        public async Task<IActionResult> BulkDelete([FromBody] List<int> ids)
        {
            if (ids == null || !ids.Any())
                return BadRequest("List of ids cannot be empty.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"DELETE FROM [dbo].[LMUserCatalogwishManagelist] WHERE Id IN @Ids";
            var rows = await connection.ExecuteAsync(sql, new { Ids = ids });
            return Ok(new { Deleted = rows });
        }
    }
}
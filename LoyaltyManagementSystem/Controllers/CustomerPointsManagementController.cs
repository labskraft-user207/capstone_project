using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using LoyaltyManagementSystem.Model;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CustomerPointsManagementController : ControllerBase
    {
        private readonly ILogger<CustomerPointsManagementController> _logger;
        private readonly IConfiguration _configuration;

        public CustomerPointsManagementController(ILogger<CustomerPointsManagementController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok("Customer Points Management controller");
        }   

        // GET: /CustomerPointsManagement/GetUserPointsSummary?userId=1
        [HttpGet("GetUserPointsSummary")]
        public async Task<IActionResult> GetUserPointsSummary(int userId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            // Query to get all points for the user
            const string pointsSql = @"
                SELECT Id, UserId, PointType, UserTier, PointGainedOn, PointGained
                FROM [dbo].[LMUserTierandPointsDetails]
                WHERE UserId = @UserId";

            var points = (await connection.QueryAsync<CustomerPoints>(pointsSql, new { UserId = userId })).ToList();

            if (!points.Any())
                return NotFound($"No points found for user with Id {userId}.");

            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var totalPoints = points.Sum(p => p.PointGained);
            var todayPoints = points.Where(p => p.PointGainedOn.Date == today).Sum(p => p.PointGained);
            var weeklyPoints = points.Where(p => p.PointGainedOn.Date >= startOfWeek).Sum(p => p.PointGained);
            var monthlyPoints = points.Where(p => p.PointGainedOn.Date >= startOfMonth).Sum(p => p.PointGained);
            var purchasePoints = points.Where(p => p.PointType == "Referral").Sum(p => p.PointGained);
            var referralPoints = points.Where(p => p.PointType == "Purchase").Sum(p => p.PointGained);
            var reviewPoints = points.Where(p => p.PointType == "Review").Sum(p => p.PointGained);

            var userTier = points.OrderByDescending(p => p.PointGainedOn).First().UserTier;

            // Redemption points: sum of pointsGained for all redemptions by this user
            const string redemptionSql = @"
                SELECT SUM(ISNULL(w.RequiredPoints, 0)) AS RedemptionPoints
                FROM [dbo].[LMUserCatalogRedemptionList] r
                INNER JOIN [dbo].[RewardCatalogMeta] w
                    ON r.CatalogId = w.Id 
                WHERE r.UserId = @UserId";

            var redemptionPoints = await connection.ExecuteScalarAsync<int?>(redemptionSql, new { UserId = userId }) ?? 0;
            totalPoints = totalPoints - redemptionPoints;

            return Ok(new
            {
                UserId = userId,
                TotalPoints = totalPoints,
                TodayPoints = todayPoints,
                WeeklyPoints = weeklyPoints,
                MonthlyPoints = monthlyPoints,
                PurchasePoints = purchasePoints,
                ReferralPoints = referralPoints,
                ReviewPoints = reviewPoints,
                UserTier = userTier,
                RedemptionPoints = redemptionPoints
            });
        }

        // GET: /CustomerPointsManagement/GetUserPointsDetails?userId=1
        [HttpGet("GetUserPointsDetails")]
        public async Task<IActionResult> GetUserPointsDetails(int userId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                SELECT Id, UserId, PointType, UserTier, PointGainedOn, PointGained
                FROM [dbo].[LMUserTierandPointsDetails]
                WHERE UserId = @UserId";

            var points = (await connection.QueryAsync<CustomerPoints>(sql, new { UserId = userId })).ToList();

            if (!points.Any())
                return NotFound($"No points found for user with Id {userId}.");

            return Ok(points);
        }

        // GET: /CustomerPointsManagement/GetPointsByActivity?userId=1&activityType=all&startDate=2024-06-01&endDate=2024-06-30
        [HttpGet("GetPointsByActivity")]
        public async Task<IActionResult> GetPointsByActivity(
            int userId,
            string activityType,
            DateTime startDate,
            DateTime endDate)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            var allowedTypes = new[] { "purchase", "referral", "review", "all" };
            if (!allowedTypes.Contains(activityType.ToLower()))
                return BadRequest("Invalid activity type. Allowed values: purchase, referral, review, all.");

            if (activityType.ToLower() == "all")
            {
                const string sql = @"
                    SELECT PointType, SUM(PointGained) AS Points
                    FROM [dbo].[LMUserTierandPointsDetails]
                    WHERE UserId = @UserId
                      AND PointGainedOn >= @StartDate
                      AND PointGainedOn <= @EndDate
                    GROUP BY PointType";

                var result = (await connection.QueryAsync(sql, new
                {
                    UserId = userId,
                    StartDate = startDate.Date,
                    EndDate = endDate.Date
                })).ToList();

                return Ok(new
                {
                    UserId = userId,
                    StartDate = startDate.Date,
                    EndDate = endDate.Date,
                    PointsByType = result
                });
            }
            else
            {
                const string sql = @"
                    SELECT SUM(PointGained) 
                    FROM [dbo].[LMUserTierandPointsDetails]
                    WHERE UserId = @UserId
                      AND LOWER(PointType) = @ActivityType
                      AND PointGainedOn >= @StartDate
                      AND PointGainedOn <= @EndDate";

                var points = await connection.ExecuteScalarAsync<int?>(sql, new
                {
                    UserId = userId,
                    ActivityType = activityType.ToLower(),
                    StartDate = startDate.Date,
                    EndDate = endDate.Date
                });

                return Ok(new
                {
                    UserId = userId,
                    ActivityType = activityType,
                    StartDate = startDate.Date,
                    EndDate = endDate.Date,
                    Points = points ?? 0
                });
            }
        }

        // GET: /CustomerPointsManagement/GetUserOrderHistory?userId=1
        [HttpGet("GetUserOrderHistory")]
        public async Task<IActionResult> GetUserOrderHistory(int userId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                SELECT orderId AS OrderId,
                       UserId,
                       pointType AS PointType,
                       OrderValue,
                       pointGainedon AS PointGainedOn,
                       pointGained AS PointGained,
                       item AS Item,
                       logic AS Logic,
                       ReviewId,
                       ReferredUsermailId AS ReferredUserMailId
                FROM [dbo].[LMUserPointsOrderHistory]
                WHERE UserId = @UserId";

            var result = await connection.QueryAsync<UserPointsOrderHistory>(sql, new { UserId = userId });
            if (!result.Any())
                return NotFound($"No order history found for user with Id {userId}.");

            return Ok(result.ToList());
        }

        // GET: /CustomerPointsManagement/GetRewardCatalogMeta
        [HttpGet("GetRewardCatalogMeta")]
        public async Task<IActionResult> GetRewardCatalogMeta()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                SELECT Id, Name, Value, RequiredPoints, Description,ImageUrl
                FROM [dbo].[RewardCatalogMeta]";

            var result = await connection.QueryAsync<RewardCatalogMeta>(sql);
            return Ok(result.ToList());
        }

        // GET: /CustomerPointsManagement/GetUserCatalogWishlist?userId=1
        [HttpGet("GetUserCatalogWishlist")]
        public async Task<IActionResult> GetUserCatalogWishlist(int userId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                SELECT Id, UserId, CatalogId
                FROM [dbo].[LMUserCatalogwishlist]
                WHERE UserId = @UserId";

            var result = await connection.QueryAsync<UserCatalogWishlist>(sql, new { UserId = userId });
            return Ok(result.ToList());
        }

        // POST: /CustomerPointsManagement/AddUserCatalogWishlist
        [HttpPost("AddUserCatalogWishlist")]
        public async Task<IActionResult> AddUserCatalogWishlist([FromBody] UserCatalogWishlist wishlist)
        {
            if (wishlist == null || wishlist.UserId == 0)
                return BadRequest("UserId is required.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                INSERT INTO [dbo].[LMUserCatalogwishlist] (UserId, CatalogId)
                VALUES (@UserId, @CatalogId);
                SELECT CAST(SCOPE_IDENTITY() as int);";

            var id = await connection.ExecuteScalarAsync<int>(sql, new { wishlist.UserId, wishlist.CatalogId });
            wishlist.Id = id;

            return CreatedAtAction(nameof(GetUserCatalogWishlist), new { userId = wishlist.UserId }, wishlist);
        }

        // DELETE: /CustomerPointsManagement/DeleteUserCatalogWishlist?id=5&userId=1
        [HttpDelete("DeleteUserCatalogWishlist")]
        public async Task<IActionResult> DeleteUserCatalogWishlist(int id, int userId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"DELETE FROM [dbo].[LMUserCatalogwishlist] WHERE CatalogId = @Id AND UserId = @UserId";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });

            if (rowsAffected == 0)
                return NotFound($"No wishlist item found with Id {id} for user {userId}.");

            return NoContent();
        }

        // POST: /CustomerPointsManagement/AddUserCatalogRedemptionList
        [HttpPost("AddUserCatalogRedemptionList")]
        public async Task<IActionResult> AddUserCatalogRedemptionList([FromBody] List<UserCatalogRedemption> redemptions)
        {
            if (redemptions == null || !redemptions.Any())
                return BadRequest("Redemption list cannot be empty.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                INSERT INTO [dbo].[LMUserCatalogRedemptionList] (UserId, Name, CatalogId, [date], status)
                VALUES (@UserId, @Name, @CatalogId, @Date, @Status);
                SELECT CAST(SCOPE_IDENTITY() as int);";

            foreach (var redemption in redemptions)
            {
                var id = await connection.ExecuteScalarAsync<int>(sql, new
                {
                    redemption.UserId,
                    redemption.Name,
                    redemption.CatalogId,
                    Date = redemption.Date.Date,
                    redemption.Status
                });
                redemption.Id = id;
            }

            return Ok(redemptions);
        }

        // DELETE: /CustomerPointsManagement/DeleteUserCatalogRedemption?id=5&userId=1
        [HttpDelete("DeleteUserCatalogRedemption")]
        public async Task<IActionResult> DeleteUserCatalogRedemption(int id, int userId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"DELETE FROM [dbo].[LMUserCatalogRedemptionList] WHERE CatalogId = @Id AND UserId = @UserId";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });

            if (rowsAffected == 0)
                return NotFound($"No redemption record found with Id {id} for user {userId}.");

            return NoContent();
        }

        // GET: /CustomerPointsManagement/GetUserCatalogRedemptionList?userId=1
        [HttpGet("GetUserCatalogRedemptionList")]
        public async Task<IActionResult> GetUserCatalogRedemptionList(int userId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                SELECT Id, UserId, Name, CatalogId, [date] AS Date, status AS Status
                FROM [dbo].[LMUserCatalogRedemptionList]
                WHERE UserId = @UserId";

            var result = await connection.QueryAsync<UserCatalogRedemption>(sql, new { UserId = userId });
            if (!result.Any())
                return NotFound($"No redemption records found for user with Id {userId}.");

            return Ok(result.ToList());
        }

        // GET: /CustomerPointsManagement/GetCustomerActivityTracker?userId=1&period=daily
        [HttpGet("GetCustomerActivityTracker")]
        public async Task<IActionResult> GetCustomerActivityTracker(int userId, string period = "daily")
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            // Set period range
            DateTime today = DateTime.UtcNow.Date;
            DateTime startDate, endDate;
            int goalTotal;
            int totalPossibleDays;
            if (period.ToLower() == "weekly")
            {
                int diff = 5;
                startDate = today.AddDays(-diff); // Start of week (Sunday)
                endDate = today;
                goalTotal = 10000;
                totalPossibleDays = (endDate - startDate).Days + 1;
            }
            else // daily
            {
                startDate = today;
                endDate = today;
                goalTotal = 1000;
                totalPossibleDays = 1;
            }

            // Fetch all activities for the user in the period
            const string sql = @"
            SELECT pointType AS PointType, pointGained AS PointGained, pointGainedon AS PointGainedOn
            FROM [dbo].[LMUserPointsOrderHistory]
            WHERE UserId = @UserId AND pointGainedon >= @StartDate AND pointGainedon <= @EndDate";

                    var activities = (await connection.QueryAsync<UserPointsOrderHistory>(sql, new
            {
                UserId = userId,
                StartDate = startDate,
                EndDate = endDate
            })).ToList();

            // Calculate total points earned in the period
            int totalPointsEarned = activities.Sum(a => a.PointGained ?? 0);

            // Calculate goalCurrent (capped at goalTotal)
            int goalCurrent = Math.Min(totalPointsEarned, goalTotal);

            // Streak calculation: for each day in the period, did the user have at least one activity?
            int streak = 0;
            if (period.ToLower() == "weekly")
            {
                for (int i = 0; i < totalPossibleDays; i++)
                {
                    var day = startDate.AddDays(i);
                    if (activities.Any(a => a.PointGainedOn?.Date == day))
                        streak++;
                }
            }
            else // daily
            {
                streak = activities.Any(a => a.PointGainedOn?.Date == today) ? 1 : 0;
            }

            // Activity list: group by PointType, show label and status (Completed/NotCompleted)
            var activityTypes = new[] { "purchase", "referral", "review" };
            var activityList = activityTypes.Select(type =>
            {
                bool completed = activities.Any(a => string.Equals(a.PointType, type, StringComparison.OrdinalIgnoreCase));
                return new
                {
                    ActivityLabel = type,
                    Status = completed ? "Completed" : "NotCompleted"
                };
            }).ToList();

            // Completion rate per activity type
            var completionRates = activityTypes.Select(type =>
            {
                int completedActions = activities.Count(a => string.Equals(a.PointType, type, StringComparison.OrdinalIgnoreCase));
                double completionRate = (double)completedActions / totalPossibleDays * 100;
                return new
                {
                    ActivityType = type,
                    CompletionRate = Math.Round(completionRate, 2)
                };
            }).ToList();

            // Fetch EnableGoalReminders from LMUserGoalReminders
            const string reminderSql = @"
                SELECT EnableGoalReminders
                FROM [dbo].[LMUserGoalReminders]
                WHERE UserId = @UserId";
            var enableGoalReminders = await connection.ExecuteScalarAsync<bool?>(reminderSql, new { UserId = userId }) ?? false;

            return Ok(new
            {
                UserId = userId,
                Period = period,
                StartDate = startDate,
                EndDate = endDate,
                TotalPointsEarned = totalPointsEarned,
                GoalCurrent = goalCurrent,
                GoalTotal = goalTotal,
                Streak = streak,
                ActivityList = activityList,
                CompletionRates = completionRates,
                EnableGoalReminders = enableGoalReminders
            });
        }

        // POST: /CustomerPointsManagement/EnableUserGoalReminders
        [HttpPost("EnableUserGoalReminders")]
        public async Task<IActionResult> EnableUserGoalReminders([FromBody] UserGoalReminder reminder)
        {
            if (reminder == null || reminder.UserId == 0)
                return BadRequest("UserId is required.");

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            // Upsert logic: update if exists, else insert
            const string sql = @"
                IF EXISTS (SELECT 1 FROM [dbo].[LMUserGoalReminders] WHERE UserId = @UserId)
                    UPDATE [dbo].[LMUserGoalReminders]
                    SET EnableGoalReminders = @EnableGoalReminders
                    WHERE UserId = @UserId
                ELSE
                    INSERT INTO [dbo].[LMUserGoalReminders] (UserId, EnableGoalReminders)
                    VALUES (@UserId, @EnableGoalReminders);";

            await connection.ExecuteAsync(sql, new { reminder.UserId, reminder.EnableGoalReminders });

            return Ok(new { reminder.UserId, reminder.EnableGoalReminders });
        }
    }
}
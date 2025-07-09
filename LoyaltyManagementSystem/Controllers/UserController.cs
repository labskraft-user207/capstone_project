using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using LoyaltyManagementSystem.Model;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IConfiguration _configuration;

        public UserController(ILogger<UserController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok("User controller");
        }

        // GET: /User/AuthenticateUser?username=admin&password=admin123
        [HttpGet("AuthenticateUser")]
        public async Task<IActionResult> CheckUser(string username, string password)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"
                SELECT Id, Username, Password, RoleId
                FROM dbo.LMUserDetails
                WHERE Username = @Username AND Password = @Password";

            var user = await connection.QueryFirstOrDefaultAsync<User>(sql, new { Username = username, Password = password });

            if (user != null)
            {
                return Ok(new { UserId = user.Id, RoleId = user.RoleId });
            }

            return NotFound("User not found or credentials are incorrect.");
        }


        // GET: /User/GetAll
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"SELECT Id, Username, Password, RoleId FROM dbo.LMUserDetails";

            var users = await connection.QueryAsync<User>(sql);
            return Ok(users.ToList());
        }

        // GET: /User/GetUserDetailsById?userId=1
        [HttpGet("GetUserDetailsById")]
        public async Task<IActionResult> GetUserDetailsById(int userId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            const string sql = @"SELECT Id, Username, Password, RoleId FROM dbo.LMUserDetails WHERE Id = @UserId";

            var user = await connection.QueryFirstOrDefaultAsync<User>(sql, new { UserId = userId });

            if (user != null)
            {
                return Ok(user);
            }

            return NotFound($"User with Id {userId} not found.");
        }

        // POST: /User/RegisterUser
        [HttpPost("RegisterUser")]
        public async Task<IActionResult> RegisterUser([FromBody] User newUser)
        {
            if (newUser == null || string.IsNullOrWhiteSpace(newUser.Username) || string.IsNullOrWhiteSpace(newUser.Password))
            {
                return BadRequest("Username and Password are required.");
            }

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            // Check if username already exists
            const string checkSql = @"SELECT COUNT(1) FROM dbo.LMUserDetails WHERE Username = @Username";
            var exists = await connection.ExecuteScalarAsync<int>(checkSql, new { newUser.Username });
            if (exists > 0)
            {
                return Conflict("Username already exists.");
            }

            const string insertSql = @"
                INSERT INTO dbo.LMUserDetails (Username, Password, RoleId)
                VALUES (@Username, @Password, @RoleId);
                SELECT CAST(SCOPE_IDENTITY() as int);";

            var userId = await connection.ExecuteScalarAsync<int>(insertSql, new { newUser.Username, newUser.Password, newUser.RoleId });
            newUser.Id = userId;

            return CreatedAtAction(nameof(GetUserDetailsById), new { userId = newUser.Id }, newUser);
        }

        // GET: /User/GetAllUserSummary
        [HttpGet("GetAllUserSummary")]
        public async Task<IActionResult> GetAllUserSummary()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            // Query to get all user details with email and signup date
            const string userSql = @"
                SELECT u.Id, u.Username, u.RoleId, a.EmailId, a.SignupDate, a.Status
                FROM dbo.LMUserDetails u
                LEFT JOIN dbo.LMUserAdditionalDetails a ON u.Id = a.UserId";

            var users = (await connection.QueryAsync<UserSummaryDto>(userSql)).ToList();

            if (!users.Any())
                return NotFound("No users found.");

            // Query to get latest tier and points status for each user
            const string tierSql = @"
                SELECT UserId, UserTier,PointType, SUM(PointGained) AS Points
                FROM dbo.LMUserTierandPointsDetails
                GROUP BY UserId, UserTier,PointType";

            var tierPoints = (await connection.QueryAsync<TierPointsDto>(tierSql)).ToList();

            // Query to get earned points from order history
            const string earnedSql = @"
                SELECT UserId, SUM(ISNULL(PointGained,0)) AS Earned
                FROM dbo.LMUserPointsOrderHistory
                GROUP BY UserId";

            var earnedPoints = (await connection.QueryAsync<UserEarnedDto>(earnedSql)).ToList();

            // Query to get points by type
            const string pointsByTypeSql = @"
                SELECT UserId, PointType, SUM(ISNULL(PointGained,0)) AS Points
                FROM dbo.LMUserPointsOrderHistory
                GROUP BY UserId, PointType";

            var pointsByType = (await connection.QueryAsync<UserPointsByTypeDto>(pointsByTypeSql)).ToList();

            const string redemptionSql = @"
                SELECT UserId, SUM(ISNULL(w.RequiredPoints, 0)) AS RedemptionPoints
                FROM [dbo].[LMUserCatalogRedemptionList] r
                INNER JOIN [dbo].[RewardCatalogMeta] w
                    ON r.CatalogId = w.Id
                    GROUP BY UserId";

            var redemptionPoints =
                (await connection.QueryAsync<UserRedemptionDto>(pointsByTypeSql)).ToList();

            // Merge all data
            foreach (var user in users)
            {
                // Tier and points by status
                var userTiers = tierPoints.Where(t => t.UserId == user.Id).ToList();
                user.Tier = userTiers.OrderByDescending(t => t.Points).FirstOrDefault()?.UserTier ?? "";

                user.RedemptionPoints = redemptionPoints.FirstOrDefault(e => e.UserId == user.Id)?.RedemptionPoints ?? 0;
                // Earned points
                user.EarnedPoints = earnedPoints.FirstOrDefault(e => e.UserId == user.Id)?.Earned ?? 0;
                user.ActivePoints = user.EarnedPoints - user.RedemptionPoints;
                // Points by type
                user.ReferralPoints = pointsByType.Where(p => p.UserId == user.Id && p.PointType.ToLower() == "referral").Sum(p => p.Points);
                user.ReviewPoints = pointsByType.Where(p => p.UserId == user.Id && p.PointType.ToLower() == "review").Sum(p => p.Points);
                user.PurchasePoints = pointsByType.Where(p => p.UserId == user.Id && p.PointType.ToLower() == "purchase").Sum(p => p.Points);
            }

            return Ok(users);
        }
    }

    // DTOs for summary
    public class UserSummaryDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public int? RoleId { get; set; }
        public string? EmailId { get; set; }
        public DateTime? SignupDate { get; set; }
        public string? Status { get; set; }
        public string Tier { get; set; } = string.Empty;
        public int ActivePoints { get; set; }
        public int EarnedPoints { get; set; }
        public int ReferralPoints { get; set; }
        public int ReviewPoints { get; set; }
        public int PurchasePoints { get; set; }
        public int RedemptionPoints { get; set; }
    }

    public class TierPointsDto
    {
        public int UserId { get; set; }
        public string UserTier { get; set; } = string.Empty;
        public string pointType { get; set; }
        public int Points { get; set; }
    }

    public class UserEarnedDto
    {
        public int UserId { get; set; }
        public int Earned { get; set; }
    }

    public class UserRedemptionDto
    {
        public int UserId { get; set; }
        public int RedemptionPoints { get; set; }
    }

    public class UserPointsByTypeDto
    {
        public int UserId { get; set; }
        public string PointType { get; set; } = string.Empty;
        public int Points { get; set; }
    }
}
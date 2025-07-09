using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using LoyaltyManagementSystem.Model;

namespace LoyaltyManagementSystem.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ReportsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET: /Reports/GetReport?type=1&dateStart=2024-06-01&dateEnd=2024-06-30
        [HttpGet("GetReport")]
        public async Task<IActionResult> GetReport(int type, DateTime dateStart, DateTime dateEnd)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            switch (type)
            {
                case 1:
                    // LMUserTierandPointsDetails
                    const string sql1 = @"
                        SELECT Id, UserId, pointType AS PointType, userTier AS UserTier, pointGainedon AS PointGainedOn, pointGained AS PointGained
                        FROM [dbo].[LMUserTierandPointsDetails]
                        WHERE pointGainedon >= @DateStart AND pointGainedon <= @DateEnd";
                    var result1 = await connection.QueryAsync<CustomerPoints>(sql1, new { DateStart = dateStart, DateEnd = dateEnd });
                    return Ok(result1.ToList());

                case 2:
                    // LMUserPointsOrderHistory
                    const string sql2 = @"
                        SELECT orderId AS OrderId, UserId, pointType AS PointType, OrderValue, pointGainedon AS PointGainedOn, pointGained AS PointGained, item AS Item, logic AS Logic, ReviewId, ReferredUsermailId
                        FROM [dbo].[LMUserPointsOrderHistory]
                        WHERE pointGainedon >= @DateStart AND pointGainedon <= @DateEnd";
                    var result2 = await connection.QueryAsync<UserPointsOrderHistory>(sql2, new { DateStart = dateStart, DateEnd = dateEnd });
                    return Ok(result2.ToList());

                case 3:
                    // RewardCatalogMeta
                    const string sql3 = @"
                        SELECT Id, Name, Value, RequiredPoints, Description
                        FROM [dbo].[RewardCatalogMeta]
                        WHERE Id IN (
                            SELECT DISTINCT CatalogId FROM [dbo].[LMUserCatalogRedemptionList]
                            WHERE [date] >= @DateStart AND [date] <= @DateEnd
                        )";
                    var result3 = await connection.QueryAsync<RewardCatalogMeta>(sql3, new { DateStart = dateStart, DateEnd = dateEnd });
                    return Ok(result3.ToList());

                case 4:
                    // Redemption points by user
                    const string sql4 = @"
                        SELECT r.UserId, SUM(ISNULL(w.RequiredPoints, 0)) AS RedemptionPoints
                        FROM [dbo].[LMUserCatalogRedemptionList] r
                        INNER JOIN [dbo].[RewardCatalogMeta] w ON r.CatalogId = w.Id
                        WHERE r.[date] >= @DateStart AND r.[date] <= @DateEnd
                        GROUP BY r.UserId";
                    var result4 = await connection.QueryAsync(sql4, new { DateStart = dateStart, DateEnd = dateEnd });
                    return Ok(result4.ToList());

                case 5:
                    // User summary (reuse UserController's logic)
                    // For brevity, only date filter on signup date
                    const string userSql = @"
                        SELECT u.Id, u.Username, u.RoleId, a.EmailId, a.SignupDate, a.Status
                        FROM dbo.LMUserDetails u
                        LEFT JOIN dbo.LMUserAdditionalDetails a ON u.Id = a.UserId
                        WHERE a.SignupDate >= @DateStart AND a.SignupDate <= @DateEnd";
                    var users = (await connection.QueryAsync<UserSummaryDto>(userSql, new { DateStart = dateStart, DateEnd = dateEnd })).ToList();
                    return Ok(users);

                default:
                    return BadRequest("Invalid report type. Allowed values: 1, 2, 3, 4, 5.");
            }
        }
    }
}
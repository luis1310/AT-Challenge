using System.Data.SqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;
using net.Models;

namespace net.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly string _connectionString;

        public AuthRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("ReferralDb")
                ?? "Server=sqlserver;Database=ReferralDb;User Id=sa;Password=ATChal1enge!;";
        }

        /// <summary>Solo agentes que no estén eliminados (Status <> 'deleted') pueden iniciar sesión.</summary>
        public Agent GetByUsername(string username)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return connection.QueryFirstOrDefault<Agent>(
                    "SELECT Id, Username, PasswordHash, FirstName, LastName, Phone, Status, ReferredById FROM Agents WHERE Username = @Username AND Status <> N'deleted'",
                    new { Username = username });
            }
        }

        public void SetStatusActive(int agentId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Execute(
                    "UPDATE Agents SET Status = 'active' WHERE Id = @Id",
                    new { Id = agentId });
            }
        }
    }
}

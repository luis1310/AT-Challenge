using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;
using net.Models;

namespace net.Repositories
{
    public class AgentsRepository : IAgentsRepository
    {
        private readonly string _connectionString;

        public AgentsRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("ReferralDb")
                ?? "Server=sqlserver;Database=ReferralDb;User Id=sa;Password=ATChal1enge!;";
        }

        public IEnumerable<Agent> GetAll()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return connection.Query<Agent>(
                    "SELECT Id, Username, FirstName, LastName, Phone, Status, ReferredById FROM Agents ORDER BY ReferredById ASC, Id ASC");
            }
        }

        /// <summary>Solo agentes con status distinto de 'deleted' (login y validación de username único).</summary>
        public Agent GetByUsername(string username)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return connection.QueryFirstOrDefault<Agent>(
                    "SELECT Id, Username, PasswordHash, FirstName, LastName, Phone, Status, ReferredById FROM Agents WHERE Username = @Username AND Status <> N'deleted'",
                    new { Username = username });
            }
        }

        public Agent GetById(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return connection.QueryFirstOrDefault<Agent>(
                    "SELECT Id, Username, FirstName, LastName, Phone, Status, ReferredById FROM Agents WHERE Id = @Id",
                    new { Id = id });
            }
        }

        /// <summary>Devuelve todos los Ids que son referidos directos o indirectos del agente (subárbol).</summary>
        public IEnumerable<int> GetDescendantIds(int agentId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                const string sql = @"
                    WITH Descendants AS (
                        SELECT Id FROM Agents WHERE ReferredById = @AgentId
                        UNION ALL
                        SELECT a.Id FROM Agents a
                        INNER JOIN Descendants d ON a.ReferredById = d.Id
                    )
                    SELECT Id FROM Descendants";
                return connection.Query<int>(sql, new { AgentId = agentId });
            }
        }

        public int Create(Agent agent)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                const string sql = @"
                    INSERT INTO Agents (Username, PasswordHash, FirstName, LastName, Phone, Status, ReferredById)
                    VALUES (@Username, @PasswordHash, @FirstName, @LastName, @Phone, @Status, @ReferredById);
                    SELECT CAST(SCOPE_IDENTITY() AS INT);";
                return connection.ExecuteScalar<int>(sql, agent);
            }
        }

        /// <summary>Borrado lógico: Status = 'deleted'. Sigue en listado con otro color y puede reactivarse.</summary>
        public bool SoftDelete(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return connection.Execute("UPDATE Agents SET Status = N'deleted' WHERE Id = @Id", new { Id = id }) > 0;
            }
        }

        public bool Reactivate(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return connection.Execute("UPDATE Agents SET Status = N'inactive' WHERE Id = @Id AND Status = N'deleted'", new { Id = id }) > 0;
            }
        }

        public bool UpdateReferredById(int agentId, int? referredById)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                return connection.Execute(
                    "UPDATE Agents SET ReferredById = @ReferredById WHERE Id = @Id",
                    new { Id = agentId, ReferredById = (object)referredById ?? DBNull.Value }
                ) > 0;
            }
        }
    }
}

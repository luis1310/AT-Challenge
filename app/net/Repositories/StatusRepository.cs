using System;
using System.Data.SqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;

namespace net.Repositories
{
    public class StatusRepository: IStatusRepository
    {
        private readonly string _connectionString;

        public StatusRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("ReferralDb")
                ?? "Server=sqlserver;Database=ReferralDb;User Id=sa;Password=ATChal1enge!;";
        }

        string IStatusRepository.getStatus()
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                try
                {
                    return connection.ExecuteScalar<string>("SELECT 'running'");
                }
                catch (Exception ex)
                {
                    return ex.Message;
                }
            }
        }

    }
}

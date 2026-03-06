using net.Models;

namespace net.Repositories
{
    public interface IAuthRepository
    {
        Agent GetByUsername(string username);
        void SetStatusActive(int agentId);
    }
}

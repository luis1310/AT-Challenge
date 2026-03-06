using System.Collections.Generic;
using net.Models;

namespace net.Repositories
{
    public interface IAgentsRepository
    {
        IEnumerable<Agent> GetAll();
        Agent GetByUsername(string username);
        Agent GetById(int id);
        /// <summary>Ids de todos los agentes que están por debajo de este en el árbol (referidos directos e indirectos).</summary>
        IEnumerable<int> GetDescendantIds(int agentId);
        int Create(Agent agent);
        /// <summary>Borrado lógico: Status = 'deleted'. Se muestra en otro color y puede reactivarse.</summary>
        bool SoftDelete(int id);
        /// <summary>Reactivar agente con Status = 'deleted' → 'inactive'.</summary>
        bool Reactivate(int id);
        bool UpdateReferredById(int agentId, int? referredById);
    }
}

using System.Collections.Generic;

namespace net.Models
{
    /// <summary>
    /// Nodo del árbol de referidos para la respuesta de GET /api/agents.
    /// </summary>
    public class AgentTreeNode
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Phone { get; set; }
        public string Status { get; set; }
        public int? ReferredById { get; set; }
        public List<AgentTreeNode> Referrals { get; set; } = new List<AgentTreeNode>();
    }
}

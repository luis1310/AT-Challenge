using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using net.Helpers;
using net.Models;
using net.Repositories;

namespace net.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AgentsController : ControllerBase
    {
        private readonly IAgentsRepository _agentsRepository;

        public AgentsController(IAgentsRepository agentsRepository)
        {
            _agentsRepository = agentsRepository;
        }

        /// <summary>
        /// Árbol de todos los agentes. Status = 'deleted' se muestra en la UI con otro color y puede reactivarse.
        /// </summary>
        [HttpGet]
        public ActionResult<IEnumerable<AgentTreeNode>> GetTree()
        {
            var all = _agentsRepository.GetAll().ToList();
            var tree = BuildTree(all, parentId: null);
            return Ok(tree);
        }

        /// <summary>
        /// Crea un nuevo agente (opcionalmente como referido de otro).
        /// </summary>
        [HttpPost]
        public IActionResult Create([FromBody] CreateAgentRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "FirstName, LastName, Username and Password are required." });
            }

            var existing = _agentsRepository.GetByUsername(request.Username.Trim());
            if (existing != null)
            {
                return BadRequest(new { message = "Username already exists." });
            }

            // Si tiene referidor, debe existir y no tener status 'deleted'.
            if (request.ReferredById.HasValue)
            {
                var referrer = _agentsRepository.GetById(request.ReferredById.Value);
                if (referrer == null || referrer.Status == "deleted")
                {
                    return BadRequest(new { message = "Referrer agent not found or has been removed." });
                }
            }

            var agent = new Agent
            {
                Username = request.Username.Trim(),
                PasswordHash = PasswordHashHelper.ComputeSha256Hex(request.Password),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Phone = request.Phone?.Trim(),
                Status = "active",
                ReferredById = request.ReferredById
            };

            var id = _agentsRepository.Create(agent);
            return Ok(new { id, message = "Agent created." });
        }

        /// <summary>
        /// Borrado lógico: Status = 'deleted'. Sigue en el listado con otro color y puede reactivarse.
        /// </summary>
        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            var agent = _agentsRepository.GetById(id);
            if (agent == null)
            {
                return NotFound(new { message = "Agent not found." });
            }
            if (agent.Status == "deleted")
            {
                return NoContent(); // ya eliminado, idempotente
            }
            _agentsRepository.SoftDelete(id);
            return NoContent();
        }

        /// <summary>
        /// Reactivar agente con Status = 'deleted' → 'inactive'.
        /// </summary>
        [HttpPost("{id:int}/reactivate")]
        public IActionResult Reactivate(int id)
        {
            var agent = _agentsRepository.GetById(id);
            if (agent == null)
            {
                return NotFound(new { message = "Agent not found." });
            }
            if (_agentsRepository.Reactivate(id))
            {
                return NoContent();
            }
            return BadRequest(new { message = "Agent is not in deleted status or could not be reactivated." });
        }

        /// <summary>
        /// Actualiza el referidor de un agente. No permite que el referidor sea el propio agente ni ninguno de sus descendientes (evita ciclos).
        /// </summary>
        [HttpPatch("{id:int}")]
        public IActionResult UpdateReferrer(int id, [FromBody] UpdateReferrerRequest request)
        {
            var agent = _agentsRepository.GetById(id);
            if (agent == null || agent.Status == "deleted")
            {
                return NotFound(new { message = "Agent not found." });
            }

            var newReferrerId = request?.ReferredById;

            if (newReferrerId.HasValue)
            {
                var newReferrer = _agentsRepository.GetById(newReferrerId.Value);
                if (newReferrer == null || newReferrer.Status == "deleted")
                {
                    return BadRequest(new { message = "New referrer not found or has been removed." });
                }
            }

            // No puede ser su propio referidor
            if (newReferrerId.HasValue && newReferrerId.Value == id)
            {
                return BadRequest(new { message = "An agent cannot be their own referrer." });
            }

            // El nuevo referidor no puede ser un descendiente (evitar ciclo: Tony -> Juan -> Jose, Jose no puede tener a Juan ni a Tony como referidor)
            if (newReferrerId.HasValue)
            {
                var descendantIds = _agentsRepository.GetDescendantIds(id).ToList();
                if (descendantIds.Contains(newReferrerId.Value))
                {
                    return BadRequest(new { message = "Referrer cannot be a descendant of this agent. Choose an agent who is not below this one in the tree." });
                }
            }

            if (!_agentsRepository.UpdateReferredById(id, newReferrerId))
            {
                return StatusCode(500, new { message = "Update failed." });
            }

            return NoContent();
        }

        private static List<AgentTreeNode> BuildTree(IReadOnlyList<Agent> all, int? parentId)
        {
            return all
                .Where(a => a.ReferredById == parentId)
                .Select(a => new AgentTreeNode
                {
                    Id = a.Id,
                    FullName = $"{a.FirstName} {a.LastName}".Trim(),
                    Username = a.Username,
                    Phone = a.Phone ?? "",
                    Status = a.Status ?? "",
                    ReferredById = a.ReferredById,
                    Referrals = BuildTree(all, a.Id)
                })
                .ToList();
        }
    }

    public class CreateAgentRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public int? ReferredById { get; set; }
    }

    public class UpdateReferrerRequest
    {
        public int? ReferredById { get; set; }
    }
}

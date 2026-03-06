using Microsoft.AspNetCore.Mvc;
using net.Services;

namespace net.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Username and password are required." });
            }

            var result = _authService.Authenticate(request.Username, request.Password);

            if (!result.Success)
            {
                return StatusCode(401, new { message = result.Message });
            }

            return Ok(new
            {
                token = result.Token,
                userId = result.UserId,
                username = result.Username,
                fullName = result.FullName
            });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}

using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using net.Helpers;
using net.Models;
using net.Repositories;

namespace net.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
        }

        public AuthResult Authenticate(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return new AuthResult { Success = false, Message = "Username and password are required." };
            }

            var agent = _authRepository.GetByUsername(username.Trim());
            if (agent == null)
            {
                return new AuthResult { Success = false, Message = "Invalid username or password." };
            }

            var passwordHashHex = PasswordHashHelper.ComputeSha256Hex(password);
            if (string.IsNullOrEmpty(agent.PasswordHash) ||
                !string.Equals(agent.PasswordHash, passwordHashHex, StringComparison.OrdinalIgnoreCase))
            {
                return new AuthResult { Success = false, Message = "Invalid username or password." };
            }

            _authRepository.SetStatusActive(agent.Id);

            var token = GenerateJwtToken(agent);
            return new AuthResult
            {
                Success = true,
                Token = token,
                UserId = agent.Id,
                Username = agent.Username,
                FullName = $"{agent.FirstName} {agent.LastName}".Trim()
            };
        }

        private string GenerateJwtToken(Agent agent)
        {
            var secretKey = _configuration["Jwt:SecretKey"] ?? "AT-Challenge-JWT-SecretKey-Min32Chars-ForHS256!";
            var issuer = _configuration["Jwt:Issuer"] ?? "ATReferralApi";
            var audience = _configuration["Jwt:Audience"] ?? "ATReferralApp";
            var expirationMinutes = int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var min) ? min : 60;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, agent.Id.ToString()),
                new Claim(ClaimTypes.Name, agent.Username),
                new Claim("fullName", $"{agent.FirstName} {agent.LastName}".Trim())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

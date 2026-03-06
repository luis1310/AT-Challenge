namespace net.Services
{
    public interface IAuthService
    {
        AuthResult Authenticate(string username, string password);
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string Token { get; set; }
        public string Message { get; set; }
        public int? UserId { get; set; }
        public string FullName { get; set; }
        public string Username { get; set; }
    }
}

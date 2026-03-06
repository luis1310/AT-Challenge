using System.Security.Cryptography;
using System.Text;

namespace net.Helpers
{
    /// <summary>
    /// Mismo criterio que SQL Server HASHBYTES('SHA2_256', N'...') (NVARCHAR = UTF-16 LE).
    /// </summary>
    public static class PasswordHashHelper
    {
        public static string ComputeSha256Hex(string plainText)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.Unicode.GetBytes(plainText);
                var hash = sha256.ComputeHash(bytes);
                var sb = new StringBuilder(hash.Length * 2);
                foreach (var b in hash)
                    sb.Append(b.ToString("x2"));
                return sb.ToString();
            }
        }
    }
}

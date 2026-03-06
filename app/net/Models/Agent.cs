namespace net.Models
{
    public class Agent
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        /// <summary>active | inactive | deleted (borrado lógico; se muestra en otro color y puede reactivarse).</summary>
        public string Status { get; set; }
        public int? ReferredById { get; set; }
    }
}

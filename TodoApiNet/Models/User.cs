using System;

namespace TodoApiNet.Models
{
    public class User
    {
        public int id { get; set; }
        public string username { get; set; } = null!;
        public string email { get; set; } = null!;
        public string password { get; set; } = null!;
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }
}

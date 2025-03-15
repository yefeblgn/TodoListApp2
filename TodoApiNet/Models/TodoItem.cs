using System;

namespace TodoApiNet.Models
{
    public class TodoItem
    {
        public int id { get; set; }
        public int user_id { get; set; }
        public string title { get; set; } = null!;
        public string? description { get; set; }
        public bool is_completed { get; set; }
        public DateTime? due_date { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }
}

using Microsoft.EntityFrameworkCore;
using TodoApiNet.Models;

namespace TodoApiNet.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<TodoItem> todos { get; set; } = null!;
        public DbSet<User> users { get; set; } = null!;
    }
}

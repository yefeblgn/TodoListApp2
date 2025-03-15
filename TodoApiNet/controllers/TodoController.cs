using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApiNet.Data;
using TodoApiNet.Models;

namespace TodoApiNet.Controllers
{
    [ApiController]
    [Route("api/todos")]
    public class TodoController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TodoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddTodo([FromBody] TodoItem todo)
        {
            if (todo.user_id == 0 || string.IsNullOrEmpty(todo.title))
                return BadRequest(new { success = false, error = "Geçersiz veri." });

            todo.is_completed = false;
            todo.created_at = DateTime.Now;
            todo.updated_at = DateTime.Now;

            _context.todos.Add(todo);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, todo_id = todo.id });
        }

        [HttpPut("edit")]
        public async Task<IActionResult> EditTodo([FromBody] TodoItem todo)
        {
            var existing = await _context.todos.FirstOrDefaultAsync(t => t.id == todo.id && t.user_id == todo.user_id);
            if (existing == null)
                return NotFound(new { success = false, error = "Todo bulunamadı." });

            existing.title = todo.title ?? existing.title;
            existing.description = todo.description ?? existing.description;
            existing.due_date = todo.due_date ?? existing.due_date;
            existing.is_completed = todo.is_completed;
            existing.updated_at = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTodo(int id, [FromBody] UserRequest request)
        {
            var existing = await _context.todos.FirstOrDefaultAsync(t => t.id == id && t.user_id == request.user_id);
            if (existing == null)
                return NotFound(new { success = false, error = "Todo bulunamadı." });

            _context.todos.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("list/{user_id}")]
        public async Task<IActionResult> ListTodos(int user_id)
        {
            var todos = await _context.todos
                .Where(t => t.user_id == user_id)
                .OrderBy(t => t.due_date)
                .ToListAsync();

            return Ok(new { success = true, todos });
        }
    }

    public class UserRequest
    {
        public int user_id { get; set; }
    }
}

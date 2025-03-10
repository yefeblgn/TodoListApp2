using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;

namespace TodoApiNet.Controllers
{
    [ApiController]
    [Route("api")]
    public class TodoController : ControllerBase
    {
        private readonly string _connectionString;
        public TodoController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpPost("add-todo")]
        public IActionResult AddTodo([FromBody] TodoItem todo)
        {
            long insertedId;
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                var query = @"
                    INSERT INTO todos 
                        (user_id, title, description, is_completed, date, created_at, updated_at)
                    VALUES
                        (@user_id, @title, @description, 0, @date, @created_at, @updated_at);
                    SELECT LAST_INSERT_ID();";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@user_id", todo.user_id);
                    cmd.Parameters.AddWithValue("@title", todo.title ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@description", string.IsNullOrEmpty(todo.description) ? (object)DBNull.Value : todo.description);
                    cmd.Parameters.AddWithValue("@date", todo.date == default(DateTime) ? (object)DBNull.Value : todo.date);
                    cmd.Parameters.AddWithValue("@created_at", DateTime.Now);
                    cmd.Parameters.AddWithValue("@updated_at", DateTime.Now);
                    insertedId = Convert.ToInt64(cmd.ExecuteScalar());
                }
            }
            return Ok(new { success = true, todo_id = insertedId });
        }

        [HttpPost("edit-todo")]
        public IActionResult EditTodo([FromBody] TodoItem todo)
        {
            int rowsAffected;
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                var query = @"
                    UPDATE todos
                    SET 
                        title = @title,
                        description = @description,
                        is_completed = @is_completed,
                        date = @date,
                        updated_at = @updated_at
                    WHERE
                        id = @id AND user_id = @user_id";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@title", todo.title ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@description", string.IsNullOrEmpty(todo.description) ? (object)DBNull.Value : todo.description);
                    cmd.Parameters.AddWithValue("@is_completed", todo.is_completed);
                    cmd.Parameters.AddWithValue("@date", todo.date == default(DateTime) ? (object)DBNull.Value : todo.date);
                    cmd.Parameters.AddWithValue("@updated_at", DateTime.Now);
                    cmd.Parameters.AddWithValue("@id", todo.id);
                    cmd.Parameters.AddWithValue("@user_id", todo.user_id);
                    rowsAffected = cmd.ExecuteNonQuery();
                }
            }
            if (rowsAffected == 0)
                return NotFound(new { success = false, error = "Todo bulunamadı." });
            return Ok(new { success = true });
        }

        [HttpPost("delete-todo")]
        public IActionResult DeleteTodo([FromBody] TodoItem todo)
        {
            int rowsAffected;
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                var query = "DELETE FROM todos WHERE id = @id AND user_id = @user_id";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@id", todo.id);
                    cmd.Parameters.AddWithValue("@user_id", todo.user_id);
                    rowsAffected = cmd.ExecuteNonQuery();
                }
            }
            if (rowsAffected == 0)
                return NotFound(new { success = false, error = "Todo bulunamadı." });
            return Ok(new { success = true });
        }

        [HttpPost("list-todo")]
        public IActionResult ListTodo([FromBody] UserRequest request)
        {
            var todos = new List<TodoItem>();
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                var query = @"
                    SELECT id, user_id, title, description, is_completed, date, created_at, updated_at 
                    FROM todos 
                    WHERE user_id = @user_id 
                    ORDER BY date ASC";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@user_id", request.user_id);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            todos.Add(new TodoItem
                            {
                                id = reader.GetInt32("id"),
                                user_id = reader.GetInt32("user_id"),
                                title = reader.IsDBNull(reader.GetOrdinal("title")) ? null : reader.GetString("title"),
                                description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString("description"),
                                is_completed = reader.GetBoolean("is_completed"),
                                date = reader.IsDBNull(reader.GetOrdinal("date")) ? default(DateTime) : reader.GetDateTime("date"),
                                created_at = reader.IsDBNull(reader.GetOrdinal("created_at")) ? default(DateTime) : reader.GetDateTime("created_at"),
                                updated_at = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? default(DateTime) : reader.GetDateTime("updated_at")
                            });
                        }
                    }
                }
            }
            return Ok(new { success = true, todos });
        }
    }

    public class TodoItem
    {
        public int id { get; set; }
        public int user_id { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public bool is_completed { get; set; }
        public DateTime date { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }

    public class UserRequest
    {
        public int user_id { get; set; }
    }
}

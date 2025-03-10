using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using System;

namespace TodoApiNet.Controllers
{
    [ApiController]
    [Route("api")]
    public class UserController : ControllerBase
    {
        private readonly string _connectionString;
        public UserController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpPost("newuser")]
        public IActionResult RegisterUser([FromBody] UserRegister user)
        {
            long insertedId;
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                var query = @"
                    INSERT INTO users 
                        (username, email, password, created_at, updated_at)
                    VALUES
                        (@username, @email, @password, @created_at, @updated_at);
                    SELECT LAST_INSERT_ID();";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@username", user.username);
                    cmd.Parameters.AddWithValue("@email", user.email);
                    cmd.Parameters.AddWithValue("@password", user.password);
                    cmd.Parameters.AddWithValue("@created_at", DateTime.Now);
                    cmd.Parameters.AddWithValue("@updated_at", DateTime.Now);
                    insertedId = Convert.ToInt64(cmd.ExecuteScalar());
                }
            }
            return Ok(new
            {
                success = true,
                user_id = insertedId,
                user = new { id = insertedId, username = user.username, email = user.email }
            });
        }

        [HttpPost("userlogin")]
        public IActionResult LoginUser([FromBody] UserLogin login)
        {
            User userFound = null;
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                var query = "SELECT id, username, email, password FROM users WHERE email = @email";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@email", login.email);
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            userFound = new User
                            {
                                id = reader.GetInt32("id"),
                                username = reader.GetString("username"),
                                email = reader.GetString("email"),
                                password = reader.GetString("password")
                            };
                        }
                    }
                }
            }
            if (userFound == null || userFound.password != login.password)
                return Unauthorized(new { success = false, error = "Geçersiz e-posta veya şifre." });
            return Ok(new
            {
                success = true,
                user = new { id = userFound.id, username = userFound.username, email = userFound.email }
            });
        }

        [HttpPost("delete-account")]
        public IActionResult DeleteAccount([FromBody] UserDelete request)
        {
            int rowsAffected;
            using (var conn = new MySqlConnection(_connectionString))
            {
                conn.Open();
                var selectQuery = "SELECT password FROM users WHERE email = @email";
                string storedPassword = null;
                using (var selectCmd = new MySqlCommand(selectQuery, conn))
                {
                    selectCmd.Parameters.AddWithValue("@email", request.email);
                    storedPassword = selectCmd.ExecuteScalar()?.ToString();
                }
                if (storedPassword == null || storedPassword != request.password)
                    return Unauthorized(new { success = false, error = "Geçersiz şifre." });
                var deleteQuery = "DELETE FROM users WHERE email = @email";
                using (var deleteCmd = new MySqlCommand(deleteQuery, conn))
                {
                    deleteCmd.Parameters.AddWithValue("@email", request.email);
                    rowsAffected = deleteCmd.ExecuteNonQuery();
                }
            }
            if (rowsAffected == 0)
                return NotFound(new { success = false, error = "Kullanıcı bulunamadı." });
            return Ok(new { success = true });
        }
    }

    public class UserRegister
    {
        public string username { get; set; }
        public string email { get; set; }
        public string password { get; set; }
    }

    public class UserLogin
    {
        public string email { get; set; }
        public string password { get; set; }
    }

    public class UserDelete
    {
        public string email { get; set; }
        public string password { get; set; }
    }

    public class User
    {
        public int id { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string password { get; set; }
    }
}

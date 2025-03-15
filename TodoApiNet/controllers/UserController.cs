using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApiNet.Data;
using TodoApiNet.Models;

namespace TodoApiNet.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegister model)
        {
            if (string.IsNullOrEmpty(model.email) || string.IsNullOrEmpty(model.password))
                return BadRequest(new { success = false, error = "Geçersiz veri." });

            var exists = await _context.users.AnyAsync(u => u.email == model.email);
            if (exists)
                return Conflict(new { success = false, error = "Bu e-posta ile kayıtlı kullanıcı mevcut." });

            var user = new User
            {
                username = model.username,
                email = model.email,
                password = model.password,
                created_at = DateTime.Now,
                updated_at = DateTime.Now
            };

            _context.users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, user_id = user.id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginUser([FromBody] UserLogin model)
        {
            var user = await _context.users.FirstOrDefaultAsync(u => u.email == model.email);
            if (user == null || user.password != model.password)
                return Unauthorized(new { success = false, error = "Geçersiz e-posta veya şifre." });

            return Ok(new { success = true, user_id = user.id });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAccount(int id, [FromBody] UserDelete model)
        {
            var user = await _context.users.FirstOrDefaultAsync(u => u.id == id && u.email == model.email);
            if (user == null || user.password != model.password)
                return Unauthorized(new { success = false, error = "Geçersiz şifre." });

            _context.users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPut("update-username")]
        public async Task<IActionResult> UpdateUsername([FromBody] UpdateUsernameRequest model)
        {
            var user = await _context.users.FirstOrDefaultAsync(u => u.id == model.id && u.email == model.email);
            if (user == null)
                return NotFound(new { success = false, error = "Kullanıcı bulunamadı." });

            user.username = model.newUsername;
            user.updated_at = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Kullanıcı adı güncellendi." });
        }

        [HttpPut("update-password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest model)
        {
            var user = await _context.users.FirstOrDefaultAsync(u => u.id == model.id && u.email == model.email);
            if (user == null || user.password != model.oldPassword)
                return Unauthorized(new { success = false, error = "Geçersiz e-posta veya eski şifre." });

            user.password = model.newPassword;
            user.updated_at = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Şifre başarıyla güncellendi." });
        }
    }

    public class UserRegister
    {
        public string username { get; set; } = null!;
        public string email { get; set; } = null!;
        public string password { get; set; } = null!;
    }

    public class UserLogin
    {
        public string email { get; set; } = null!;
        public string password { get; set; } = null!;
    }

    public class UserDelete
    {
        public string email { get; set; } = null!;
        public string password { get; set; } = null!;
    }

    public class UpdateUsernameRequest
    {
        public int id { get; set; }
        public string email { get; set; } = null!;
        public string newUsername { get; set; } = null!;
    }

    public class UpdatePasswordRequest
    {
        public int id { get; set; }
        public string email { get; set; } = null!;
        public string oldPassword { get; set; } = null!;
        public string newPassword { get; set; } = null!;
    }
}

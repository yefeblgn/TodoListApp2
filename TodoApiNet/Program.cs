using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using TodoApiNet.Data;

var builder = WebApplication.CreateBuilder(args);

// **Veritabanı Bağlantısını Ekle (MySQL)**
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(connectionString)); // ✅ MySQL için doğru kullanım

// **Controller'ları Aktif Et**
builder.Services.AddControllers();

// **CORS Politikası Ekle (Eğer frontend bağlanacaksa)**
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// **Swagger (API Dokümantasyonu) Ekleyelim**
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// **Geliştirme Ortamı İçin Swagger UI**
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// **CORS Kullanımı Açık Olsun**
app.UseCors("AllowAll");

// **Routing ve Controller'ları Kullan**
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using GroupGame.Application.Common.Interfaces;
using GroupGame.Application.Services;
using GroupGame.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add PostgreSQL with EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=groupgamedb;Username=postgres;Password=postgres";

builder.Services.AddDbContext<GroupGameDbContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("GroupGame.Infrastructure")));

builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<GroupGameDbContext>());
builder.Services.AddScoped<GameService>();

// Add Controllers & ProblemDetails
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();

// Swagger Documentation with JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Group Game App API", Version = "v2.0" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_jwt_key_group_game_app_2026";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "GroupGameApp",
            ValidAudience = "GroupGameApp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

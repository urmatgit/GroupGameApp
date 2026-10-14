using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Maui.Storage;

namespace GroupGame.Mobile.Services;

public class TokenStorageService
{
    private const string AccessTokenKey = "jwt_access_token";
    private const string RefreshTokenKey = "jwt_refresh_token";

    // Strictly uses SecureStorage, zero SQLite per Section 1 & 20
    public async Task SaveTokensAsync(string accessToken, string refreshToken)
    {
        await SecureStorage.Default.SetAsync(AccessTokenKey, accessToken);
        await SecureStorage.Default.SetAsync(RefreshTokenKey, refreshToken);
    }

    public async Task<string?> GetAccessTokenAsync()
    {
        return await SecureStorage.Default.GetAsync(AccessTokenKey);
    }

    public void ClearTokens()
    {
        SecureStorage.Default.Remove(AccessTokenKey);
        SecureStorage.Default.Remove(RefreshTokenKey);
    }
}

public class UserPreferencesService
{
    private const string CityIdKey = "user_pref_city_id";
    private const string SelectedSportKey = "user_pref_sport_id";

    // Strictly uses Preferences for settings, zero SQLite per Section 1 & 20
    public string SelectedCityId
    {
        get => Preferences.Default.Get(CityIdKey, string.Empty);
        set => Preferences.Default.Set(CityIdKey, value);
    }

    public string SelectedSportId
    {
        get => Preferences.Default.Get(SelectedSportKey, string.Empty);
        set => Preferences.Default.Set(SelectedSportKey, value);
    }
}

public class ApiClient
{
    private readonly HttpClient _httpClient;
    private readonly TokenStorageService _tokenStorage;

    public ApiClient(HttpClient httpClient, TokenStorageService tokenStorage)
    {
        _httpClient = httpClient;
        _tokenStorage = tokenStorage;
    }

    public async Task<T?> GetAsync<T>(string uri)
    {
        await AddAuthHeaderAsync();
        return await _httpClient.GetFromJsonAsync<T>(uri);
    }

    public async Task<HttpResponseMessage> PostAsync<T>(string uri, T payload)
    {
        await AddAuthHeaderAsync();
        return await _httpClient.PostAsJsonAsync(uri, payload);
    }

    private async Task AddAuthHeaderAsync()
    {
        var token = await _tokenStorage.GetAccessTokenAsync();
        if (!string.IsNullOrEmpty(token))
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
    }
}

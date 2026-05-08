# Фикс ролей администратора в Keycloak
# Этот файл необходим для ручного восстановления прав доступа, если автоматический импорт не сработал.
$keycloakUrl = "http://localhost:8080"

Write-Host "Getting admin token..."
# Запрос токена авторизации через встроенный клиент admin-cli для доступа к Admin REST API
$token = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=admin&password=admin&grant_type=password&client_id=admin-cli"

# Get admin user
# Поиск уникального идентификатора (ID) пользователя в базе Keycloak по его имени
$users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users?username=admin" -Headers @{ Authorization = "Bearer $($token.access_token)" }
$adminId = $users[0].id
Write-Host "Admin user ID: $adminId"

# Get available roles
# Запрос списка всех ролей, созданных в реалме 'canteen'
$realmRoles = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/roles" -Headers @{ Authorization = "Bearer $($token.access_token)" }

# Find admin role
# Фильтрация полученного списка для нахождения объекта нужной роли
$adminRole = $realmRoles | Where-Object { $_.name -eq "admin" }
Write-Host "Admin role: $($adminRole | ConvertTo-Json)"

# Assign admin role to user
# Если роль найдена, отправляем запрос на её привязку к пользователю (Role Mapping)
if ($adminRole) {
    $roleJson = @($adminRole) | ConvertTo-Json -Depth 3
    try {
        # POST запрос к API Keycloak для добавления связи "Пользователь -> Роль"
        $null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users/$adminId/role-mappings/realm" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $($token.access_token)" } -Body $roleJson
        Write-Host "Admin role assigned!" -ForegroundColor Green
    } catch {
        Write-Host "Role already assigned or error: $_"
    }
}

# Test login
# Имитация процесса входа клиента для получения итогового Access Token
Write-Host "Testing login with roles..."
$test = Invoke-RestMethod -Uri "$keycloakUrl/realms/canteen/protocol/openid-connect/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=admin&password=admin123&grant_type=password&client_id=canteen-web&client_secret=VCHfWLinO4Vx8hM2e4a8fVpflPuSButf"

# Decode token to check roles
# Извлечение Payload части JWT-токена (середина между точками)
$tokenParts = $test.access_token.Split('.')
# Декодирование содержимого из формата Base64 в читаемую строку JSON
$payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
$decoded = $payload | ConvertFrom-Json

# Вывод финального списка ролей, которые теперь видит сервер приложения при проверке прав
Write-Host "User roles: $($decoded.realm_access.roles | ConvertTo-Json)"
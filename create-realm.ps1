# PowerShell script to create Keycloak users (skip if exists)
$ErrorActionPreference = "Continue"

$keycloakUrl = "http://localhost:8080"
$adminUser = "admin"
$adminPassword = "admin"

Write-Host "Getting admin token..."

$tokenResponse = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" `
    -Method POST `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "username=$adminUser&password=$adminPassword&grant_type=password&client_id=admin-cli"

$accessToken = $tokenResponse.access_token
Write-Host "Got admin token"

# Skip realm creation - already exists
Write-Host "Realm already exists, checking users..."

# Try to get existing admin user ID
try {
    $users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users?username=admin" -Headers @{ Authorization = "Bearer $accessToken" }
    $adminId = $users[0].id
    Write-Host "Admin user already exists (ID: $adminId)"
} catch {
    Write-Host "Creating admin user..."
    $adminUserConfig = @{
        username = "admin"
        enabled = $true
        emailVerified = $true
        firstName = "Администратор"
        lastName = "Системы"
        email = "admin@sibsiu.ru"
        credentials = @(@{ type = "password"; value = "admin123"; temporary = $false })
    } | ConvertTo-Json -Depth 3
    
    try {
        $null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $accessToken" } -Body $adminUserConfig
        Write-Host "Admin user created"
        
        $users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users?username=admin" -Headers @{ Authorization = "Bearer $accessToken" }
        $adminId = $users[0].id
        
        $adminRole = @{ name = "admin" } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users/$adminId/role-mappings/realm" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $accessToken" } -Body $adminRole
        Write-Host "Admin role assigned"
    } catch {
        Write-Host "Admin user may already exist: $_"
    }
}

# Check/create student user
try {
    $users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users?username=student" -Headers @{ Authorization = "Bearer $accessToken" }
    if ($users.Count -gt 0) {
        Write-Host "Student user already exists"
    }
} catch {
    Write-Host "Creating student user..."
    $studentUserConfig = @{
        username = "student"
        enabled = $true
        emailVerified = $true
        firstName = "Иван"
        lastName = "Студентов"
        email = "student@sibsiu.ru"
        credentials = @(@{ type = "password"; value = "student123"; temporary = $false })
    } | ConvertTo-Json -Depth 3
    
    try {
        $null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $accessToken" } -Body $studentUserConfig
        Write-Host "Student user created"
    } catch {
        Write-Host "Student user may already exist: $_"
    }
}

Write-Host "Testing login..."
$testLogin = Invoke-RestMethod -Uri "$keycloakUrl/realms/canteen/protocol/openid-connect/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=admin&password=admin123&grant_type=password&client_id=canteen-web&client_secret=VCHfWLinO4Vx8hM2e4a8fVpflPuSButf"
if ($testLogin.access_token) {
    Write-Host "Login SUCCESS!" -ForegroundColor Green
} else {
    Write-Host "Login failed: $testLogin"
}

Write-Host "Done!"

Write-Host "Creating admin user..."

$adminUserConfig = @{
    username = "admin"
    enabled = $true
    emailVerified = $true
    firstName = "Администратор"
    lastName = "Системы"
    email = "admin@sibsiu.ru"
    credentials = @(
        @{
            type = "password"
            value = "admin123"
            temporary = $false
        }
    )
} | ConvertTo-Json -Depth 3

$null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $accessToken" } `
    -Body $adminUserConfig

Write-Host "Getting admin user ID..."
$users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users?username=admin" -Headers @{ Authorization = "Bearer $accessToken" }
$adminId = $users[0].id

Write-Host "Assigning admin role..."
$adminRole = @{
    name = "admin"
} | ConvertTo-Json

$null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users/$adminId/role-mappings/realm" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $accessToken" } `
    -Body $adminRole

Write-Host "Creating student user..."

$studentUserConfig = @{
    username = "student"
    enabled = $true
    emailVerified = $true
    firstName = "Иван"
    lastName = "Студентов"
    email = "student@sibsiu.ru"
    credentials = @(
        @{
            type = "password"
            value = "student123"
            temporary = $false
        }
    )
} | ConvertTo-Json -Depth 3

$null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $accessToken" } `
    -Body $studentUserConfig

Write-Host "Done! Realm 'canteen' created successfully." -ForegroundColor Green
Write-Host "Users: admin/admin123, student/student123"
# Delete all users in canteen realm
$keycloakUrl = "http://localhost:8080"

Write-Host "Getting admin token..."
$token = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=admin&password=admin&grant_type=password&client_id=admin-cli"
$token.access_token

Write-Host "Getting all users..."
$users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users" -Headers @{ Authorization = "Bearer $($token.access_token)" }

foreach ($u in $users) {
    Write-Host "Deleting user: $($u.username)"
    $null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users/$($u.id)" -Method DELETE -Headers @{ Authorization = "Bearer $($token.access_token)" }
}

Write-Host "All users deleted. Now creating new users..."

# Create admin
$adminJson = @{
    username = "admin"
    enabled = $true
    emailVerified = $true
    firstName = "Admin"
    lastName = "User"
    email = "admin@test.ru"
    credentials = @(@{ type = "password"; value = "admin123"; temporary = $false })
} | ConvertTo-Json -Depth 3

$null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $($token.access_token)" } -Body $adminJson
Write-Host "Admin created"

# Get admin ID
$users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users?username=admin" -Headers @{ Authorization = "Bearer $($token.access_token)" }
$adminId = $users[0].id

# Add realm roles
$adminRole = @(@{ name = "admin"; container = $null }) | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users/$adminId/role-mappings/realm" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $($token.access_token)" } -Body $adminRole
$studentRole = @(@{ name = "student"; container = $null }) | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users/$adminId/role-mappings/realm" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $($token.access_token)" } -Body $studentRole
Write-Host "Roles assigned to admin"

# Create student
$studentJson = @{
    username = "student"
    enabled = $true
    emailVerified = $true
    firstName = "Student"
    lastName = "User"
    email = "student@test.ru"
    credentials = @(@{ type = "password"; value = "student123"; temporary = $false })
} | ConvertTo-Json -Depth 3

$null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $($token.access_token)" } -Body $studentJson
Write-Host "Student created"

# Test login
Write-Host "Testing login..."
$test = Invoke-RestMethod -Uri "$keycloakUrl/realms/canteen/protocol/openid-connect/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=admin&password=admin123&grant_type=password&client_id=canteen-web&client_secret=VCHfWLinO4Vx8hM2e4a8fVpflPuSButf"

if ($test.access_token) {
    Write-Host "LOGIN WORKS!" -ForegroundColor Green
} else {
    Write-Host "Login failed: $test"
}
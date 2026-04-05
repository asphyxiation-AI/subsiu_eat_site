# Fix admin roles in Keycloak
$keycloakUrl = "http://localhost:8080"

Write-Host "Getting admin token..."
$token = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=admin&password=admin&grant_type=password&client_id=admin-cli"

# Get admin user
$users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users?username=admin" -Headers @{ Authorization = "Bearer $($token.access_token)" }
$adminId = $users[0].id
Write-Host "Admin user ID: $adminId"

# Get available roles
$realmRoles = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/roles" -Headers @{ Authorization = "Bearer $($token.access_token)" }

# Find admin role
$adminRole = $realmRoles | Where-Object { $_.name -eq "admin" }
Write-Host "Admin role: $($adminRole | ConvertTo-Json)"

# Assign admin role to user
if ($adminRole) {
    $roleJson = @($adminRole) | ConvertTo-Json -Depth 3
    try {
        $null = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/canteen/users/$adminId/role-mappings/realm" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $($token.access_token)" } -Body $roleJson
        Write-Host "Admin role assigned!" -ForegroundColor Green
    } catch {
        Write-Host "Role already assigned or error: $_"
    }
}

# Test login
Write-Host "Testing login with roles..."
$test = Invoke-RestMethod -Uri "$keycloakUrl/realms/canteen/protocol/openid-connect/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=admin&password=admin123&grant_type=password&client_id=canteen-web&client_secret=VCHfWLinO4Vx8hM2e4a8fVpflPuSButf"

# Decode token to check roles
$tokenParts = $test.access_token.Split('.')
$payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
$decoded = $payload | ConvertFrom-Json

Write-Host "User roles: $($decoded.realm_access.roles | ConvertTo-Json)"
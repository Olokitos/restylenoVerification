# PowerShell script to automatically fix Herd Nginx timeout configuration
Write-Host "=== Auto-Fixing Laravel Herd Nginx Timeout ===" -ForegroundColor Cyan
Write-Host ""

# Try multiple possible locations for Herd config
$possiblePaths = @(
    "$env:APPDATA\Herd\config\nginx",
    "$env:LOCALAPPDATA\Herd\config\nginx",
    "C:\Program Files\Herd\config\nginx",
    "C:\ProgramData\Herd\config\nginx"
)

$herdConfigPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $herdConfigPath = $path
        Write-Host "Found Herd Nginx config at: $path" -ForegroundColor Green
        break
    }
}

if (-not $herdConfigPath) {
    Write-Host "Could not find Herd Nginx config directory." -ForegroundColor Red
    Write-Host "Please manually locate it and run this script with the path as parameter." -ForegroundColor Yellow
    exit 1
}

# Find the site config file
$configFiles = Get-ChildItem -Path $herdConfigPath -Filter "*.conf" | Where-Object { $_.Name -like "*restyle10*" -or $_.Name -like "*test*" }

if ($configFiles.Count -eq 0) {
    # If no specific match, try to find any .conf file
    $configFiles = Get-ChildItem -Path $herdConfigPath -Filter "*.conf"
}

if ($configFiles.Count -eq 0) {
    Write-Host "No .conf files found in: $herdConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Found config files:" -ForegroundColor Yellow
foreach ($file in $configFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor White
}

# Process each config file
foreach ($configFile in $configFiles) {
    Write-Host ""
    Write-Host "Processing: $($configFile.Name)" -ForegroundColor Cyan
    
    $content = Get-Content $configFile.FullName -Raw
    $originalContent = $content
    
    # Check if timeout settings already exist
    if ($content -match "fastcgi_read_timeout") {
        Write-Host "  Timeout settings already exist. Updating values..." -ForegroundColor Yellow
        
        # Update existing timeout values
        $content = $content -replace "fastcgi_read_timeout\s+\d+;", "fastcgi_read_timeout 300;"
        $content = $content -replace "fastcgi_send_timeout\s+\d+;", "fastcgi_send_timeout 300;"
    } else {
        Write-Host "  Adding timeout settings..." -ForegroundColor Yellow
        
        # Find the location ~ \.php$ block and add timeout settings
        if ($content -match "(location\s+~\s+\\\.php\$\s*\{[^}]*)(include\s+fastcgi_params;)") {
            $replacement = "`$1`$2`n    `n    fastcgi_read_timeout 300;`n    fastcgi_send_timeout 300;"
            $content = $content -replace "(location\s+~\s+\\\.php\$\s*\{[^}]*)(include\s+fastcgi_params;)", $replacement
        } elseif ($content -match "(location\s+~\s+\\\.php\$\s*\{[^}]*)(\})") {
            # If include fastcgi_params is not found, add before the closing brace
            $replacement = "`$1`n    fastcgi_read_timeout 300;`n    fastcgi_send_timeout 300;`n    `$2"
            $content = $content -replace "(location\s+~\s+\\\.php\$\s*\{[^}]*)(\})", $replacement
        } else {
            Write-Host "  Warning: Could not find PHP location block. Manual editing may be required." -ForegroundColor Red
            continue
        }
    }
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        # Create backup
        $backupPath = "$($configFile.FullName).backup"
        Copy-Item $configFile.FullName $backupPath
        Write-Host "  Backup created: $backupPath" -ForegroundColor Gray
        
        # Write updated content
        Set-Content -Path $configFile.FullName -Value $content -NoNewline
        Write-Host "  Successfully updated: $($configFile.Name)" -ForegroundColor Green
    } else {
        Write-Host "  No changes needed: $($configFile.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Configuration Update Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Please restart Laravel Herd for changes to take effect:" -ForegroundColor Yellow
Write-Host "1. Open Laravel Herd application" -ForegroundColor White
Write-Host "2. Click 'Restart' or 'Stop' then 'Start'" -ForegroundColor White
Write-Host ""


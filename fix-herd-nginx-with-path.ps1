# PowerShell script to fix Herd Nginx timeout - Run with config file path
# Usage: .\fix-herd-nginx-with-path.ps1 "C:\path\to\restyle10.test.conf"

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = ""
)

Write-Host "=== Auto-Fixing Laravel Herd Nginx Timeout ===" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($ConfigPath)) {
    Write-Host "Please provide the path to your Nginx config file." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\fix-herd-nginx-with-path.ps1 'C:\path\to\restyle10.test.conf'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or drag and drop the config file onto this script." -ForegroundColor Yellow
    Write-Host ""
    
    # Try to find it automatically
    $possiblePaths = @(
        "$env:APPDATA\Herd\config\nginx",
        "$env:LOCALAPPDATA\Herd\config\nginx"
    )
    
    foreach ($basePath in $possiblePaths) {
        if (Test-Path $basePath) {
            $files = Get-ChildItem -Path $basePath -Filter "*.conf" -ErrorAction SilentlyContinue
            if ($files) {
                Write-Host "Found config files in: $basePath" -ForegroundColor Green
                foreach ($file in $files) {
                    Write-Host "  - $($file.FullName)" -ForegroundColor White
                }
                Write-Host ""
                Write-Host "Run this script again with one of these paths:" -ForegroundColor Yellow
                foreach ($file in $files) {
                    Write-Host "  .\fix-herd-nginx-with-path.ps1 '$($file.FullName)'" -ForegroundColor Gray
                }
            }
        }
    }
    exit
}

if (-not (Test-Path $ConfigPath)) {
    Write-Host "Error: Config file not found at: $ConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host "Processing: $ConfigPath" -ForegroundColor Cyan

# Read the file
$content = Get-Content $ConfigPath -Raw
$originalContent = $content

# Check if timeout settings already exist
if ($content -match "fastcgi_read_timeout") {
    Write-Host "  Timeout settings found. Updating to 300 seconds..." -ForegroundColor Yellow
    $content = $content -replace "fastcgi_read_timeout\s+\d+;", "fastcgi_read_timeout 300;"
    $content = $content -replace "fastcgi_send_timeout\s+\d+;", "fastcgi_send_timeout 300;"
} else {
    Write-Host "  Adding timeout settings..." -ForegroundColor Yellow
    
    # Try to find and update the PHP location block
    if ($content -match "(location\s+~\s+\\\.php\$\s*\{[^\}]*?)(include\s+fastcgi_params;)") {
        $content = $content -replace "(location\s+~\s+\\\.php\$\s*\{[^\}]*?)(include\s+fastcgi_params;)", "`$1`$2`n    fastcgi_read_timeout 300;`n    fastcgi_send_timeout 300;"
        Write-Host "  Added timeout settings after fastcgi_params" -ForegroundColor Green
    } elseif ($content -match "(location\s+~\s+\\\.php\$\s*\{[^\}]*?)(\})") {
        $content = $content -replace "(location\s+~\s+\\\.php\$\s*\{[^\}]*?)(\})", "`$1    fastcgi_read_timeout 300;`n    fastcgi_send_timeout 300;`n    `$2"
        Write-Host "  Added timeout settings before closing brace" -ForegroundColor Green
    } else {
        Write-Host "  Warning: Could not automatically find PHP location block." -ForegroundColor Red
        Write-Host "  Please manually edit the file and add these lines in the 'location ~ \.php$' block:" -ForegroundColor Yellow
        Write-Host "    fastcgi_read_timeout 300;" -ForegroundColor White
        Write-Host "    fastcgi_send_timeout 300;" -ForegroundColor White
        exit 1
    }
}

# Only write if content changed
if ($content -ne $originalContent) {
    # Create backup
    $backupPath = "$ConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $ConfigPath $backupPath
    Write-Host "  Backup created: $backupPath" -ForegroundColor Gray
    
    # Write updated content
    [System.IO.File]::WriteAllText($ConfigPath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  Successfully updated configuration!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart Laravel Herd" -ForegroundColor White
    Write-Host "2. Test the AI recommendation feature" -ForegroundColor White
} else {
    Write-Host "  No changes needed - timeout settings already configured correctly." -ForegroundColor Gray
}


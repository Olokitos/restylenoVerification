# PowerShell script to help locate and fix Herd Nginx configuration
Write-Host "=== Laravel Herd Nginx Timeout Fix ===" -ForegroundColor Cyan
Write-Host ""

# Try to find Herd config directory
$herdConfigPath = "$env:APPDATA\Herd\config\nginx"

if (Test-Path $herdConfigPath) {
    Write-Host "Found Herd Nginx config at: $herdConfigPath" -ForegroundColor Green
    Write-Host ""
    
    # List all .conf files
    $configFiles = Get-ChildItem -Path $herdConfigPath -Filter "*.conf"
    
    if ($configFiles.Count -eq 0) {
        Write-Host "No .conf files found in the directory" -ForegroundColor Red
        Write-Host "Please check the directory manually: $herdConfigPath" -ForegroundColor Yellow
    } else {
        Write-Host "Found the following configuration files:" -ForegroundColor Yellow
        Write-Host ""
        
        $index = 1
        foreach ($file in $configFiles) {
            Write-Host "[$index] $($file.Name)" -ForegroundColor White
            $index++
        }
        
        Write-Host ""
        Write-Host "Please follow these steps:" -ForegroundColor Cyan
        Write-Host "1. Open the config file for your site (likely restyle10.test.conf)" -ForegroundColor White
        Write-Host "2. Find the location block for PHP files" -ForegroundColor White
        Write-Host "3. Add these two lines inside that block:" -ForegroundColor White
        Write-Host "   fastcgi_read_timeout 300;" -ForegroundColor Yellow
        Write-Host "   fastcgi_send_timeout 300;" -ForegroundColor Yellow
        Write-Host "4. Save the file" -ForegroundColor White
        Write-Host "5. Restart Herd" -ForegroundColor White
        Write-Host ""
        
        # Try to open the directory in File Explorer
        Write-Host "Opening the config directory in File Explorer..." -ForegroundColor Cyan
        Start-Process explorer.exe -ArgumentList $herdConfigPath
    }
} else {
    Write-Host "Could not find Herd config at: $herdConfigPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check if Herd is installed in a different location:" -ForegroundColor Yellow
    Write-Host "- C:\Program Files\Herd\" -ForegroundColor White
    Write-Host "- C:\ProgramData\Herd\" -ForegroundColor White
}

Write-Host ""
Write-Host "Script completed. Check the File Explorer window that opened." -ForegroundColor Green

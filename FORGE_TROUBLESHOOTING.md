# 🔧 Laravel Forge Troubleshooting Guide

## Quick Fix Commands for "Page Not Working" Error

Run these commands in Forge → Site → Commands (or Console):

### 1. Generate APP_KEY (if missing)
```bash
php artisan key:generate --force
```

### 2. Clear All Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 3. Rebuild Config Cache
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. Install Dependencies
```bash
composer install --no-dev --optimize-autoloader
npm install
npm run build
```

### 5. Fix Permissions
```bash
chmod -R 775 storage bootstrap/cache
chown -R forge:forge storage bootstrap/cache
```

### 6. Link Storage
```bash
php artisan storage:link
```

### 7. Run Migrations (if database is set up)
```bash
php artisan migrate --force
```

### 8. Check PHP Version
```bash
php -v
```

---

## Complete Setup Script (Run All at Once)

Copy and paste this entire block into Forge Console:

```bash
# Navigate to site directory
cd /home/forge/your-site-name.com

# Generate APP_KEY
php artisan key:generate --force

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install
npm run build

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Fix permissions
chmod -R 775 storage bootstrap/cache
chown -R forge:forge storage bootstrap/cache

# Link storage
php artisan storage:link

# Run migrations
php artisan migrate --force

echo "✅ Setup complete! Check your site now."
```

**⚠️ Replace `your-site-name.com` with your actual site directory name!**

---

## Common Error Fixes

### Error: "APP_KEY not set"
```bash
php artisan key:generate --force
php artisan config:cache
```

### Error: "Database connection failed"
1. Go to Server → Database tab
2. Copy database password
3. Go to Site → Environment tab
4. Update `DB_PASSWORD=your_password_here`
5. Save and run: `php artisan config:cache`

### Error: "Class not found"
```bash
composer install --no-dev --optimize-autoloader
composer dump-autoload
```

### Error: "Mix manifest not found" or "Vite manifest not found"
```bash
npm install
npm run build
```

### Error: "Permission denied" on storage
```bash
chmod -R 775 storage bootstrap/cache
chown -R forge:forge storage bootstrap/cache
```

### Error: "500 Internal Server Error"
1. Check logs: Site → Logs → View Latest Logs
2. Enable debug temporarily:
   - Site → Environment → Set `APP_DEBUG=true`
   - Save and refresh page
   - You'll see the actual error
   - Fix the error
   - Set `APP_DEBUG=false` back

### Error: "502 Bad Gateway - upstream sent too big header"
**Problem:** Nginx's FastCGI buffer sizes are too small for the response headers from PHP-FPM. This commonly happens when:
- Sessions contain large amounts of data
- Cookies are too large
- Response headers exceed default buffer sizes

**Error Message in Nginx Logs:**
```
upstream sent too big header while reading response header from upstream
```

**How to Fix:**
1. Go to **Forge → Site → Nginx** tab
2. Find the `location ~ \.php$ {` block (or the FastCGI location block)
3. Add these buffer size directives inside that block:
   ```nginx
   fastcgi_buffers 16 16k;
   fastcgi_buffer_size 32k;
   fastcgi_busy_buffers_size 64k;
   ```
4. Also add these in the `server {` block (outside location blocks):
   ```nginx
   fastcgi_hide_header X-Powered-By;
   ```
5. Click **"Update Nginx Configuration"**
6. Restart Nginx: `sudo systemctl restart nginx`

**Complete Nginx Configuration Example:**
```nginx
server {
    # ... other server config ...
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Increase buffer sizes to handle large headers
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_busy_buffers_size 64k;
        fastcgi_temp_file_write_size 64k;
        
        # Timeouts
        fastcgi_read_timeout 300s;
        fastcgi_send_timeout 300s;
    }
}
```

**Alternative: If you can't edit Nginx config directly:**
If Forge doesn't allow direct Nginx editing, you can also reduce session/cookie size in Laravel:
1. Go to **Site → Environment**
2. Add or update:
   ```
   SESSION_DRIVER=file
   SESSION_LIFETIME=120
   ```
3. Clear session data: `php artisan cache:clear`

**Verify the Fix:**
After making changes, test by:
- Adding a wardrobe item with images
- Creating a marketplace listing
- Check Nginx error logs: `Server → Logs → Nginx Error Log` (should no longer show the error)

---

## Check Nginx Configuration

1. Go to Site → "Nginx" tab
2. Verify the configuration looks correct
3. If you made changes, click "Update Nginx Configuration"

---

## Verify Deployment

1. Go to Site → "Deployments" tab
2. Check if latest deployment succeeded
3. If it failed, click "View Output" to see errors
4. Click "Deploy Now" to redeploy

---

## Test Routes

After fixing, test these URLs:
- `http://YOUR_IP/simple-test` - Should return JSON
- `http://YOUR_IP/` - Should show homepage

---

## Still Not Working?

1. **Check Server Resources:**
   - Server → Metrics
   - Ensure CPU/RAM/Disk aren't maxed

2. **Check Nginx Error Logs:**
   - Server → Logs → Nginx Error Log

3. **Check PHP-FPM Status:**
   - Server → Logs → PHP-FPM Log

4. **Verify Site Directory:**
   - Make sure site directory matches your repository name
   - Check: Site → App tab → Directory


# 🔧 Fix 502 Error - Wardrobe & Marketplace Uploads

## 🎯 Main Causes for 502 Error on Upload

When adding wardrobe items or creating marketplace listings, the 502 error is most commonly caused by:

### 0. **"upstream sent too big header" Error** ⚠️ MOST COMMON FOR THIS ISSUE
**Problem:** Nginx's FastCGI buffer sizes are too small for response headers from PHP-FPM.

**Error in Nginx Logs:**
```
upstream sent too big header while reading response header from upstream
```

**How to Fix:**
1. Go to **Forge → Site → Nginx** tab
2. Find the `location ~ \.php$ {` block
3. Add these lines inside that block:
   ```nginx
   fastcgi_buffers 16 16k;
   fastcgi_buffer_size 32k;
   fastcgi_busy_buffers_size 64k;
   fastcgi_temp_file_write_size 64k;
   ```
4. Click **"Update Nginx Configuration"**
5. Restart Nginx: `sudo systemctl restart nginx`

**See FORGE_TROUBLESHOOTING.md for complete details.**

---

### 1. **Missing Storage Link** ⚠️ MOST COMMON
**Problem:** The symbolic link from `public/storage` to `storage/app/public` doesn't exist.

**Symptoms:**
- 502 error when uploading images
- Files might upload but can't be accessed
- Storage operations fail silently

**How to Check:**
```bash
# In Forge → Site → Console
ls -la public/ | grep storage
# Should show: storage -> ../storage/app/public
```

**How to Fix:**
```bash
php artisan storage:link
# Verify it worked:
ls -la public/storage
```

---

### 2. **Storage Directory Permissions** 🔒
**Problem:** PHP-FPM can't write to `storage/app/public` directory.

**How to Check:**
```bash
ls -la storage/app/
# Should show 'public' directory with proper permissions
```

**How to Fix:**
```bash
# Set correct permissions
chmod -R 775 storage/app/public
chown -R forge:forge storage/app/public

# Also ensure parent directories are writable
chmod -R 775 storage
chown -R forge:forge storage
```

---

### 3. **PHP Upload Limits Too Low** 📤
**Problem:** PHP's `upload_max_filesize` or `post_max_size` is smaller than your image files.

**Your Code Limits:**
- Wardrobe: 5MB per image (`max:5120`)
- Marketplace: 10MB per image (`max:10240`)

**How to Check:**
```bash
# In Forge → Site → Console
php -i | grep -E "upload_max_filesize|post_max_size|max_execution_time|memory_limit"
```

**Expected Values:**
```
upload_max_filesize = 10M (or higher)
post_max_size = 12M (should be larger than upload_max_filesize)
max_execution_time = 300 (or higher for uploads)
memory_limit = 256M (or higher)
```

**How to Fix:**
1. Go to **Forge → Server → PHP** tab
2. Edit PHP configuration
3. Add or update:
```ini
upload_max_filesize = 10M
post_max_size = 12M
max_execution_time = 300
memory_limit = 256M
```
4. Restart PHP-FPM: `sudo systemctl restart php8.2-fpm`

---

### 4. **PHP-FPM Timeout** ⏱️
**Problem:** PHP-FPM times out before file upload completes.

**How to Check:**
```bash
# Check PHP-FPM config
sudo cat /etc/php/8.2/fpm/pool.d/www.conf | grep -E "request_terminate_timeout|max_execution_time"
```

**How to Fix:**
1. Edit PHP-FPM pool config:
```bash
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

2. Add or update:
```ini
request_terminate_timeout = 300
```

3. Restart PHP-FPM:
```bash
sudo systemctl restart php8.2-fpm
```

---

### 5. **Nginx Timeout** 🌐
**Problem:** Nginx times out waiting for PHP-FPM to process the upload.

**How to Check:**
```bash
# Check Nginx config in Forge → Site → Nginx
# Look for timeout settings
```

**How to Fix:**
1. Go to **Forge → Site → Nginx** tab
2. Add or update in the server block:
```nginx
client_max_body_size 20M;  # Allow larger uploads
proxy_read_timeout 300s;   # Wait up to 5 minutes
fastcgi_read_timeout 300s; # Wait up to 5 minutes
```

3. Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

### 6. **Disk Space Full** 💿
**Problem:** Server ran out of disk space, can't save uploaded files.

**How to Check:**
```bash
df -h
# Check if any partition is 100% full
```

**How to Fix:**
```bash
# Clean old logs
find storage/logs -name "*.log" -mtime +7 -delete

# Clear Laravel caches
php artisan cache:clear
php artisan view:clear

# Check for large files
du -sh storage/app/public/* | sort -h
```

---

### 7. **Memory Exhaustion** 💾
**Problem:** Processing multiple large images exhausts PHP memory.

**How to Check:**
```bash
# Check PHP-FPM logs for memory errors
sudo tail -100 /var/log/php8.2-fpm.log | grep -i memory
```

**How to Fix:**
1. Increase `memory_limit` in PHP config (see #3 above)
2. Restart PHP-FPM

---

## 🔍 Quick Diagnosis Steps

### Step 1: Check Laravel Logs
```bash
# In Forge → Site → Logs
tail -100 storage/logs/laravel.log | grep -i "error\|exception\|failed"
```

Look for:
- `StorageException`
- `Permission denied`
- `No such file or directory`
- `Memory exhausted`
- `Maximum execution time exceeded`

### Step 2: Check PHP-FPM Logs
```bash
sudo tail -100 /var/log/php8.2-fpm.log
```

Look for:
- `WARNING: [pool www] child X exited on signal 11`
- `WARNING: [pool www] child X exited with code 255`
- Memory/timeout errors

### Step 3: Test Storage Manually
```bash
# Test if storage is writable
touch storage/app/public/test.txt
# If this fails, it's a permissions issue

# Test if storage link exists
ls -la public/storage
# Should show a symlink, not a directory
```

### Step 4: Test File Upload Limits
```bash
php -r "echo 'upload_max_filesize: ' . ini_get('upload_max_filesize') . PHP_EOL;"
php -r "echo 'post_max_size: ' . ini_get('post_max_size') . PHP_EOL;"
php -r "echo 'memory_limit: ' . ini_get('memory_limit') . PHP_EOL;"
php -r "echo 'max_execution_time: ' . ini_get('max_execution_time') . PHP_EOL;"
```

---

## ✅ Complete Fix Checklist

Run these commands in order:

```bash
# 1. Fix storage permissions
chmod -R 775 storage bootstrap/cache
chown -R forge:forge storage bootstrap/cache

# 2. Create storage link
php artisan storage:link

# 3. Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 4. Rebuild caches
php artisan config:cache
php artisan route:cache

# 5. Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

# 6. Verify storage is writable
touch storage/app/public/test.txt && rm storage/app/public/test.txt
echo "✅ Storage is writable"
```

---

## 🚨 Most Likely Fix for Your Issue

Based on production deployments, the **most common cause** is:

1. **Missing storage link** - Run `php artisan storage:link`
2. **Storage permissions** - Fix with `chmod -R 775 storage`
3. **PHP upload limits too low** - Increase in PHP config

**Try these first:**
```bash
php artisan storage:link
chmod -R 775 storage
sudo systemctl restart php8.2-fpm
```

---

## 📝 Additional Notes

### Your Code Configuration:
- **Wardrobe images:** Max 5MB per image, multiple images allowed
- **Marketplace images:** Max 10MB per image, up to 5 images
- **Storage disk:** `public` (uses `storage/app/public`)

### Recommended PHP Settings for Production:
```ini
upload_max_filesize = 10M
post_max_size = 12M
max_execution_time = 300
memory_limit = 256M
max_input_time = 300
```

### Recommended Nginx Settings:
```nginx
client_max_body_size 20M;
proxy_read_timeout 300s;
fastcgi_read_timeout 300s;
```

---

## 🔄 After Fixing

1. **Test the upload:**
   - Try adding a wardrobe item with an image
   - Try creating a marketplace listing with images
   - Check if images appear correctly

2. **Monitor logs:**
   - Watch `storage/logs/laravel.log` for any errors
   - Check PHP-FPM logs if issues persist

3. **Verify file storage:**
   - Check `storage/app/public/wardrobe/` for uploaded wardrobe images
   - Check `storage/app/public/products/` for uploaded product images
   - Verify files are accessible via `https://your-site.com/storage/...`

---

**Last Updated:** 2025-11-15
**For:** Restyle10 Production Deployment


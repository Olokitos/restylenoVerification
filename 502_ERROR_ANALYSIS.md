# 🔍 502 Bad Gateway Error - Main Causes

## Top 5 Most Common Reasons for 502 Errors

### 1. **PHP-FPM Crashed or Stopped** ⚠️ MOST COMMON
**What it means:** The PHP process manager stopped responding to Nginx requests.

**Causes:**
- PHP-FPM crashed due to fatal error
- Out of memory (OOM)
- Configuration error
- Server restart/maintenance
- Too many concurrent requests

**How to check:**
```bash
# In Forge → Site → Commands
sudo systemctl status php8.2-fpm  # Check if running
sudo tail -50 /var/log/php8.2-fpm.log  # Check crash logs
```

**How to fix:**
```bash
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
```

---

### 2. **Database Connection Failed** 🗄️
**What it means:** Laravel can't connect to MySQL/MariaDB.

**Causes:**
- Database server crashed or stopped
- Wrong credentials in `.env`
- Database server max connections reached
- Network timeout
- Database locked or corrupted

**How to check:**
```bash
# In Forge → Site → Commands
php artisan tinker
# Then type:
DB::connection()->getPdo();
# If it fails, database connection is the issue
```

**How to fix:**
- Check `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` in Forge → Site → Environment
- Restart database: `sudo systemctl restart mysql`
- Check database status: `sudo systemctl status mysql`

---

### 3. **N+1 Query Problem** 🐌 PERFORMANCE ISSUE
**What it means:** Making too many database queries, causing timeout or memory exhaustion.

**YOUR CODE HAS THIS ISSUE:**
```php
// MarketplaceController.php lines 113-114
$products->getCollection()->transform(function ($product) {
    $ratingAverage = round($product->user->receivedRatings()->avg('rating') ?? 0, 1);
    $ratingCount = $product->user->receivedRatings()->count();
    // ...
});
```

**Problem:**
- For 12 products on a page, this makes **24+ separate queries** (2 per product)
- Plus 6 featured products = **12 more queries**
- Total: **36+ queries** per page load
- If database is slow, this can easily cause timeout → 502 error

**How to check:**
```bash
# Enable query logging temporarily
# In .env: DB_LOG_QUERIES=true
# Then check storage/logs/laravel.log
```

**How to fix:**
- Use eager loading with aggregation
- Pre-calculate ratings in a single query
- Cache rating data

---

### 4. **Memory Exhaustion** 💾
**What it means:** PHP ran out of memory processing the request.

**Causes:**
- Loading too much data (all products without pagination)
- Large file uploads
- Memory limit too low (default 128M)
- Infinite loops or recursion

**How to check:**
```bash
# Check PHP-FPM logs for "Allowed memory size exhausted"
sudo tail -100 /var/log/php8.2-fpm.log | grep -i memory
```

**How to fix:**
- Increase `memory_limit` in `php.ini` (e.g., 256M or 512M)
- Optimize queries (fix N+1 problems)
- Use pagination properly
- Clear caches

---

### 5. **Missing APP_KEY or Config Issues** 🔑
**What it means:** Laravel can't bootstrap properly.

**Causes:**
- `APP_KEY` is empty or missing
- Corrupted configuration cache
- Missing environment variables
- `.env` file not readable

**How to check:**
```bash
# In Forge → Site → Environment
# Check if APP_KEY has a value starting with "base64:"
php artisan tinker
# Type: config('app.key')
# Should return a long string, not null
```

**How to fix:**
```bash
php artisan key:generate --force
php artisan config:clear
php artisan config:cache
```

---

### 6. **Request Timeout** ⏱️
**What it means:** Request took longer than allowed time.

**Causes:**
- Slow database queries (N+1 problem)
- External API calls (Hugging Face API)
- Large data processing
- Timeout limits too low

**How to check:**
```bash
# Check Nginx/PHP-FPM timeout settings
# Usually 60-90 seconds for PHP-FPM
# Check Cloudflare timeout (default 100 seconds)
```

**How to fix:**
- Increase `max_execution_time` in PHP
- Increase `request_terminate_timeout` in PHP-FPM config
- Optimize slow queries
- Cache expensive operations

---

### 7. **Disk Space Full** 💿
**What it means:** Server ran out of disk space.

**Causes:**
- Log files too large
- Uploaded files accumulating
- Database files growing
- Temporary files not cleaned

**How to check:**
```bash
df -h  # Check disk usage
du -sh storage/logs/*  # Check log sizes
```

**How to fix:**
```bash
# Clean old logs
php artisan log:clear  # If you have this command
# Or manually:
find storage/logs -name "*.log" -mtime +7 -delete

# Clear Laravel caches
php artisan cache:clear
php artisan view:clear
```

---

### 8. **Nginx Configuration Issue** 🌐
**What it means:** Nginx can't communicate with PHP-FPM.

**Causes:**
- Wrong PHP-FPM socket path
- PHP-FPM pool name mismatch
- Nginx can't reach PHP-FPM
- Socket permissions wrong

**How to check:**
```bash
sudo nginx -t  # Test Nginx config
sudo tail -50 /var/log/nginx/error.log
```

**How to fix:**
- Verify Nginx config in Forge → Site → Nginx
- Restart both: `sudo systemctl restart nginx && sudo systemctl restart php8.2-fpm`

---

## 🎯 Quick Diagnosis Steps

### Step 1: Check PHP-FPM Status
```bash
sudo systemctl status php8.2-fpm
```

### Step 2: Check Laravel Logs
```bash
# In Forge → Site → Logs
tail -100 storage/logs/laravel.log
```

### Step 3: Check PHP-FPM Logs
```bash
sudo tail -100 /var/log/php8.2-fpm.log
```

### Step 4: Test Database Connection
```bash
php artisan tinker
DB::connection()->getPdo();
```

### Step 5: Check Disk Space
```bash
df -h
```

---

## 🔧 Immediate Fix (Try These First)

```bash
# 1. Restart PHP-FPM
sudo systemctl restart php8.2-fpm

# 2. Restart Nginx
sudo systemctl restart nginx

# 3. Clear Laravel caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 4. Rebuild caches
php artisan config:cache
php artisan route:cache

# 5. Fix permissions
chmod -R 775 storage bootstrap/cache
```

---

## 🚨 Most Likely Cause for YOUR Site

Based on your code, the **N+1 query problem** in `MarketplaceController` is very likely causing the 502 error, especially when:
- You have many products
- Products have many ratings
- Database is under load

The rating queries (lines 113-114, 137-138) are making **dozens of separate queries** on every page load, which can easily cause timeouts.

**Recommended Fix:** Optimize the rating queries to use a single aggregated query instead of querying for each product individually.


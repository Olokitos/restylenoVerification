# Fixing 504 Gateway Timeout in Laravel Herd

## Problem
Laravel Herd uses Nginx, which has a default timeout of 60 seconds. When the AI recommendation takes longer than this, you get a 504 Gateway Timeout error.

## Solution: Increase Nginx Timeout in Herd

### For Windows:

1. **Find Herd's Nginx Configuration:**
   - Herd stores its configs in: `C:\Users\<YourUsername>\AppData\Roaming\Herd\config\nginx\`
   - Or check: `%APPDATA%\Herd\config\nginx\`

2. **Edit the Site Configuration:**
   - Look for a file named `restyle10.test.conf` or similar
   - Or edit the main `nginx.conf` file in that directory

3. **Add Timeout Settings:**
   
   In the `location ~ \.php$ {` block, add:
   ```nginx
   fastcgi_read_timeout 300;
   fastcgi_send_timeout 300;
   ```
   
   In the `http {` block (if editing main nginx.conf), add:
   ```nginx
   fastcgi_read_timeout 300;
   fastcgi_send_timeout 300;
   proxy_read_timeout 300;
   ```

4. **Restart Herd:**
   - Open Herd application
   - Click "Restart" or "Stop" then "Start"

### Alternative: Edit via Herd CLI

If Herd has a CLI, you might be able to:
```bash
herd restart
```

### Quick Method - Edit Site Config:

1. Open File Explorer
2. Navigate to: `%APPDATA%\Herd\config\nginx\`
3. Find `restyle10.test.conf` (or your site's config file)
4. Open it in a text editor
5. Find the `location ~ \.php$ {` block
6. Add these lines inside it:
   ```nginx
   fastcgi_read_timeout 300;
   fastcgi_send_timeout 300;
   ```
7. Save the file
8. Restart Herd from the application

### Example Configuration:

```nginx
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    
    # Add these lines:
    fastcgi_read_timeout 300;
    fastcgi_send_timeout 300;
}
```

## After Making Changes

1. Restart Herd (Stop → Start)
2. Test the AI recommendation again
3. The 504 error should be resolved

## What We've Fixed

✅ PHP execution time limit: Removed (set to 0)  
✅ HTTP client timeout: 90 seconds  
✅ Frontend retry logic: Added  
❌ **Nginx timeout: Needs to be increased in Herd config** ← You are here


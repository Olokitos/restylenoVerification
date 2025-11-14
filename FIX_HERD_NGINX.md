# Step-by-Step Guide: Fix Nginx Timeout in Laravel Herd

## Step 1: Locate Herd's Nginx Configuration

1. Press `Windows Key + R` to open Run dialog
2. Type: `%APPDATA%\Herd\config\nginx`
3. Press Enter - This will open File Explorer to the Nginx config directory

**Alternative path if above doesn't work:**
- `C:\Users\<YourUsername>\AppData\Roaming\Herd\config\nginx\`

## Step 2: Find Your Site Configuration File

Look for one of these files:
- `restyle10.test.conf`
- Or check all `.conf` files in that directory

## Step 3: Edit the Configuration File

1. Right-click on `restyle10.test.conf` (or your site's config file)
2. Choose "Open with" → "Notepad" or your preferred text editor
3. Find the section that looks like this:

```nginx
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

## Step 4: Add Timeout Settings

Add these two lines **inside** the `location ~ \.php$ {` block:

```nginx
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    
    # Add these two lines:
    fastcgi_read_timeout 300;
    fastcgi_send_timeout 300;
}
```

## Step 5: Save and Restart

1. Save the file (Ctrl+S)
2. Open Laravel Herd application
3. Click "Restart" or "Stop" then "Start"

## Complete Example Configuration

Here's what the complete `location ~ \.php$ {` block should look like:

```nginx
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    
    fastcgi_read_timeout 300;
    fastcgi_send_timeout 300;
}
```

## Verification

After restarting Herd, test the AI recommendation feature. The 504 Gateway Timeout error should be resolved.

## Troubleshooting

If you can't find the config file:
1. Check if Herd is installed in a different location
2. Look in: `C:\Program Files\Herd\` or `C:\ProgramData\Herd\`
3. Check Herd's settings/preferences for config location

If the changes don't take effect:
1. Make sure you saved the file
2. Make sure you restarted Herd completely
3. Check Nginx error logs in Herd


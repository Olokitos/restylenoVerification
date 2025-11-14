# Finding Herd Nginx Config - Quick Guide

Since you're in `C:\Users\Ken\AppData\Roaming\Herd`, here's what to do:

## Step 1: Check for config directory

In File Explorer (you're already there), look for:
- `config` folder
- `nginx` folder  
- Any `.conf` files

## Step 2: Common Herd Config Locations on Windows

Try these paths in File Explorer:

1. **C:\Users\Ken\AppData\Local\Herd\config\nginx\**
2. **C:\Program Files\Herd\config\nginx\**
3. **C:\ProgramData\Herd\config\nginx\**

## Step 3: If you find the config files

Look for a file named:
- `restyle10.test.conf`
- Or any `.conf` file in that directory

## Step 4: Once you find the config file

1. Right-click it → Open with Notepad
2. Find this block:
   ```nginx
   location ~ \.php$ {
       fastcgi_pass ...
       ...
   }
   ```
3. Add these two lines inside that block:
   ```nginx
   fastcgi_read_timeout 300;
   fastcgi_send_timeout 300;
   ```
4. Save (Ctrl+S)
5. Restart Herd

## Alternative: Use the auto-fix script

If you find the config file path, run:
```powershell
.\fix-herd-nginx-with-path.ps1 "C:\full\path\to\restyle10.test.conf"
```


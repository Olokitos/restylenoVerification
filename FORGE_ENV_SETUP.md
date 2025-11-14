# 🔐 Laravel Forge Environment Setup Guide

## Quick Setup Checklist

### ✅ Step 1: Access Environment in Forge
1. Go to **Site** → **Environment** tab
2. You'll see the `.env` file editor

### ✅ Step 2: Get Database Password
1. Go to **Server** → **Database** tab
2. Click the **eye icon** 👁️ to reveal password
3. Copy the password

### ✅ Step 3: Paste Production Config
Copy the configuration from below and paste into Forge Environment editor.

### ✅ Step 4: Replace These Values:
- `YOUR_SERVER_IP` → Your actual server IP (e.g., `http://123.45.67.89`)
- `YOUR_DATABASE_PASSWORD_HERE` → Password from Step 2
- `APP_KEY` → Leave empty, will be generated

### ✅ Step 5: Save and Generate APP_KEY
1. Click **"Save"** in Environment tab
2. Go to **Commands** section
3. Run: `php artisan key:generate --force`
4. Run: `php artisan config:cache`

---

## Complete Production .env Configuration

```bash
# Application Configuration
APP_NAME=Restyle
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://YOUR_SERVER_IP

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

# Logging
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=forge
DB_USERNAME=forge
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE

# Session
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=false

# Broadcasting
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local

# Queue
QUEUE_CONNECTION=database

# Cache
CACHE_STORE=database

# Memcached Configuration
MEMCACHED_HOST=127.0.0.1

# Redis Configuration
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail Configuration
MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@your-domain.com"
MAIL_FROM_NAME="${APP_NAME}"

# AWS Configuration (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# Vite Configuration
VITE_APP_NAME="${APP_NAME}"
VITE_WEATHER_API_KEY=6e830a5991ec8515dd4c1e1531069009

# Vite Dev Server Configuration
VITE_DEV_SERVER_HOST=127.0.0.1
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HMR_HOST=127.0.0.1
VITE_DEV_SERVER_HMR_PORT=5173

# Third-Party API Keys
# Hugging Face API for AI recommendations
HUGGING_FACE_API_TOKEN=YOUR_HUGGING_FACE_API_TOKEN_HERE

# Pusher Configuration (Optional)
VITE_PUSHER_APP_KEY=
VITE_PUSHER_HOST=
VITE_PUSHER_PORT=
VITE_PUSHER_SCHEME=
VITE_PUSHER_APP_CLUSTER=
```

---

## Important Notes

### 🔑 APP_KEY
- **Leave empty** in the config above
- **Generate after saving**: `php artisan key:generate --force`
- Forge will automatically add it to your `.env` file

### 🔐 Secrets Already Included
- ✅ **Hugging Face API Token**: Already in the config above
- ✅ **Weather API Key**: Already in the config above
- ⚠️ **Database Password**: You need to get this from Forge
- ⚠️ **APP_URL**: Replace with your server IP

### 📝 Why .env.example Doesn't Have Real Values
- `.env.example` is a **template** for developers
- It should **never** contain real secrets
- Real values go in the **actual `.env` file** on the server
- Forge manages the `.env` file through the Environment tab

---

## After Setup - Run These Commands

```bash
# Generate APP_KEY
php artisan key:generate --force

# Clear and rebuild caches
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install
npm run build

# Fix permissions
chmod -R 775 storage bootstrap/cache
php artisan storage:link

# Run migrations
php artisan migrate --force
```

---

## Verify Setup

After completing all steps, check:
1. ✅ `APP_KEY` has a value (base64:...)
2. ✅ `HUGGING_FACE_API_TOKEN` has your token
3. ✅ `DB_PASSWORD` has your database password
4. ✅ `APP_URL` has your server IP
5. ✅ Site is accessible via browser

---

## Troubleshooting

### If APP_KEY is still empty:
```bash
php artisan key:generate --force
php artisan config:cache
```

### If database connection fails:
1. Double-check `DB_PASSWORD` matches Forge database password
2. Verify `DB_DATABASE=forge` and `DB_USERNAME=forge`
3. Run: `php artisan config:cache`

### If site still shows error:
1. Check logs: Site → Logs → View Latest Logs
2. Enable debug temporarily: `APP_DEBUG=true`
3. See actual error, fix it, then set `APP_DEBUG=false`


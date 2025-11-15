# ⚡ Quick Deployment Reference

## 🚀 Fast Track Deployment (3 Steps)

### 1️⃣ Commit & Push Your Code

```bash
# Make sure .env is NOT being committed
git status | grep .env  # Should return nothing

# Stage and commit changes
git add .
git commit -m "Deploy: Updated system"
git push origin main
```

### 2️⃣ Deploy in Forge

**Option A: Automatic (Easiest)**
- Go to Forge → Your Site → **Deployments** tab
- Click **"Deploy Now"** button

**Option B: Manual**
- Go to Forge → Your Site → **Console** tab
- Run the commands from Step 3 below

### 3️⃣ Post-Deployment Commands

Run these in Forge Console or Commands section:

```bash
cd /home/forge/your-site-name.com
git pull origin main
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan migrate --force
php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear
php artisan config:cache && php artisan route:cache && php artisan view:cache
composer dump-autoload --optimize
php artisan storage:link
```

---

## ✅ Verify Deployment

1. Visit your site URL
2. Test key features
3. Check logs if errors: `tail -f storage/logs/laravel.log`

---

## 🔧 Common Fixes

**500 Error?**
```bash
# Temporarily enable debug in Forge Environment
APP_DEBUG=true
# See error, fix it, then disable
```

**Missing Assets?**
```bash
npm run build
```

**Permission Issues?**
```bash
chmod -R 775 storage bootstrap/cache
```

---

**For detailed instructions, see `DEPLOYMENT_GUIDE.md`**



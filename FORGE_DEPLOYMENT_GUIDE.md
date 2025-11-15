# 🚀 Laravel Forge Deployment Guide

## Quick Deployment Steps

### Method 1: Using Forge Dashboard (Recommended)

1. **Go to Laravel Forge Dashboard**
   - Visit: https://forge.laravel.com
   - Select your site/server

2. **Deploy via Dashboard**
   - Click on your site
   - Go to "Deployments" tab
   - Click **"Deploy Now"** button

3. **Forge will automatically:**
   - Pull latest code from GitHub
   - Run composer install
   - Run npm install & npm run build
   - Run migrations
   - Clear and rebuild caches

---

### Method 2: Using Forge Deployment Script

If you have a custom deployment script configured in Forge, it should include:

```bash
cd /home/forge/your-site-name.com
git pull origin main
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan migrate --force
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer dump-autoload --optimize
php artisan storage:link || true
```

---

### Method 3: Manual SSH Deployment

If you need to deploy manually via SSH:

1. **SSH into your Forge server**
   ```bash
   ssh forge@your-server-ip
   ```

2. **Navigate to your site directory**
   ```bash
   cd /home/forge/your-site-name.com
   ```

3. **Pull latest code**
   ```bash
   git pull origin main
   ```

4. **Install dependencies**
   ```bash
   composer install --no-dev --optimize-autoloader
   npm install
   ```

5. **Build assets**
   ```bash
   npm run build
   ```

6. **Run migrations** (IMPORTANT for the new migration)
   ```bash
   php artisan migrate --force
   ```

7. **Clear and rebuild caches**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

8. **Optimize**
   ```bash
   composer dump-autoload --optimize
   ```

---

## ⚠️ Important Notes for This Deployment

### New Migration Added
You have a **new migration** that needs to run:
- `2025_11_15_162550_make_size_nullable_in_wardrobe_items_table.php`

This migration makes the `size` column nullable in the `wardrobe_items` table, which is required for Hat and Accessories categories.

### Changes Deployed

1. **Payment Verification Flow**
   - Prevents bypass of payment verification
   - Fixes backend to allow 'delivered' status
   - Strengthens validation

2. **Wardrobe Fixes**
   - Hat and Accessories categories now work correctly
   - Size field is optional for these categories

---

## 🔍 Verify Deployment

After deployment, verify:

1. **Check if migration ran:**
   ```bash
   php artisan migrate:status
   ```
   Should show the new migration as "Ran"

2. **Test Hat/Accessories:**
   - Try adding a Hat or Accessories item in wardrobe
   - Should work without size field

3. **Test Payment Flow:**
   - Verify payment verification is required before shipping
   - Check that delivered transactions can be marked as collected

---

## 🐛 Troubleshooting

### If deployment fails:

1. **Check Forge logs:**
   - Go to Forge Dashboard → Your Site → Logs
   - Look for deployment errors

2. **Check migration status:**
   ```bash
   php artisan migrate:status
   ```

3. **Manually run migration if needed:**
   ```bash
   php artisan migrate --force
   ```

4. **Clear all caches:**
   ```bash
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

---

## 📝 Forge Deployment Script Template

If you want to update your Forge deployment script, use this:

```bash
cd /home/forge/your-site-name.com

git pull origin main

composer install --no-dev --optimize-autoloader

npm ci
npm run build

php artisan migrate --force

php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

composer dump-autoload --optimize

php artisan storage:link || true
```

---

## ✅ Post-Deployment Checklist

- [ ] Migration ran successfully
- [ ] Assets built correctly
- [ ] Hat/Accessories items can be added
- [ ] Payment verification flow works
- [ ] No errors in Forge logs
- [ ] Site is accessible and functional


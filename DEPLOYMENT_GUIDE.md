# 🚀 Deployment Guide - Deploying to Existing Server

This guide will help you deploy your edited system to your existing Laravel Forge server and site.

## 📋 Pre-Deployment Checklist

### ✅ Step 1: Verify Your Changes

Check what files have been modified:
```bash
git status
```

**Important Files Modified:**
- Controllers (AIRecommenderController, MarketplaceController, TransactionController, etc.)
- Models (User.php)
- Frontend components (React/TypeScript files)
- Routes (web.php)
- Configuration files

### ✅ Step 2: Ensure .env is NOT Committed

**CRITICAL:** Never commit your `.env` file!

```bash
# Verify .env is ignored
git status | grep .env

# If .env appears, remove it from tracking
git rm --cached .env
```

Your `.env` file should **NOT** appear in `git status`.

---

## 🔄 Step 3: Commit and Push Your Changes

### A. Stage Your Changes

```bash
# Add all modified and new files (except .env)
git add .

# Review what will be committed
git status
```

### B. Commit Your Changes

```bash
git commit -m "Deploy: Updated system with latest changes

- Updated controllers (AI, Marketplace, Transaction, Wardrobe)
- Added notification system
- Updated frontend components
- Configuration updates"
```

### C. Push to Repository

```bash
git push origin main
```

**✅ Your code is now in the repository and ready for deployment!**

---

## 🌐 Step 4: Deploy to Laravel Forge

### Option A: Automatic Deployment (Recommended)

If your Forge site is connected to your Git repository:

1. **Go to Laravel Forge Dashboard**
   - Navigate to your **Server**
   - Click on your **Site**

2. **Trigger Deployment**
   - Go to **"Deployments"** tab
   - Click **"Deploy Now"** button
   - Forge will automatically:
     - Pull latest code from your repository
     - Run deployment script
     - Install dependencies
     - Build assets

### Option B: Manual Deployment via Forge Console

If you need to deploy manually:

1. **Open Forge Console**
   - Go to your **Site** in Forge
   - Click **"Console"** tab

2. **Navigate to Site Directory**
   ```bash
   cd /home/forge/your-site-name.com
   ```

3. **Pull Latest Code**
   ```bash
   git pull origin main
   ```

4. **Run Deployment Commands** (see Step 5 below)

---

## ⚙️ Step 5: Post-Deployment Setup

Run these commands in Forge Console or via the "Commands" section:

### A. Install Dependencies

```bash
# Install PHP dependencies (production mode)
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies
npm install

# Build production assets
npm run build
```

### B. Run Database Migrations

**⚠️ IMPORTANT:** Check if you have new migrations first!

```bash
# Check for pending migrations
php artisan migrate:status

# Run new migrations
php artisan migrate --force
```

**New Migrations to Check:**
- `2025_11_14_103535_create_notifications_table.php` (if not already run)

### C. Clear and Rebuild Caches

```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Rebuild production caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### D. Fix Permissions

```bash
# Set correct permissions
chmod -R 775 storage bootstrap/cache
chown -R forge:forge storage bootstrap/cache

# Ensure storage link exists
php artisan storage:link
```

### E. Optimize Autoloader

```bash
composer dump-autoload --optimize
```

---

## 🔐 Step 6: Verify Environment Variables

### Check Your Production .env

1. **Go to Forge → Site → Environment tab**
2. **Verify these critical variables are set:**

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com  # Update with your actual domain

# Database (should already be configured)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=forge
DB_USERNAME=forge
DB_PASSWORD=your_password_from_forge

# Hugging Face API (for AI recommendations)
HUGGING_FACE_API_TOKEN=YOUR_HUGGING_FACE_API_TOKEN_HERE

# Weather API
VITE_WEATHER_API_KEY=6e830a5991ec8515dd4c1e1531069009
```

### If Environment Variables Need Updating:

1. Edit in Forge → Site → Environment tab
2. Save changes
3. Run: `php artisan config:cache`

---

## 🧪 Step 7: Test Your Deployment

### A. Check Site Accessibility

1. Visit your site URL in a browser
2. Check for any error pages
3. Test key functionality:
   - User login/registration
   - Marketplace browsing
   - Product creation
   - Transaction flow
   - Notifications (if implemented)

### B. Check Logs

If you encounter errors:

1. **Laravel Logs:**
   ```bash
   # In Forge Console
   tail -f storage/logs/laravel.log
   ```

2. **Forge Logs:**
   - Go to Site → Logs → View Latest Logs

### C. Common Issues & Fixes

#### Issue: "500 Internal Server Error"
```bash
# Enable debug temporarily to see error
# In Forge Environment, set: APP_DEBUG=true
# Save, refresh page, see error
# Fix error, then set APP_DEBUG=false
```

#### Issue: "Class not found"
```bash
composer dump-autoload --optimize
php artisan config:cache
```

#### Issue: "Vite manifest not found"
```bash
npm run build
```

#### Issue: "Permission denied"
```bash
chmod -R 775 storage bootstrap/cache
chown -R forge:forge storage bootstrap/cache
```

---

## 📝 Step 8: Complete Deployment Script

For convenience, here's a complete deployment script you can run in Forge Console:

```bash
#!/bin/bash
# Complete Deployment Script for Laravel Forge

# Navigate to site directory (UPDATE THIS PATH!)
cd /home/forge/your-site-name.com

echo "🔄 Pulling latest code..."
git pull origin main

echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "📦 Installing Node.js dependencies..."
npm install

echo "🏗️ Building production assets..."
npm run build

echo "🗄️ Running database migrations..."
php artisan migrate --force

echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "⚡ Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "🔧 Optimizing autoloader..."
composer dump-autoload --optimize

echo "🔗 Linking storage..."
php artisan storage:link

echo "✅ Deployment complete!"
```

**⚠️ Remember to update `/home/forge/your-site-name.com` with your actual site directory path!**

---

## 🎯 Quick Deployment Checklist

Use this checklist to ensure nothing is missed:

- [ ] Verified `.env` is NOT in git
- [ ] Committed all changes
- [ ] Pushed to repository
- [ ] Triggered deployment in Forge (or pulled code manually)
- [ ] Installed PHP dependencies (`composer install --no-dev`)
- [ ] Installed Node.js dependencies (`npm install`)
- [ ] Built production assets (`npm run build`)
- [ ] Ran database migrations (`php artisan migrate --force`)
- [ ] Cleared all caches
- [ ] Rebuilt production caches
- [ ] Fixed file permissions
- [ ] Verified environment variables
- [ ] Tested site functionality
- [ ] Checked logs for errors

---

## 🔄 Future Deployments

For future deployments, you can simplify the process:

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Deploy in Forge:**
   - Click "Deploy Now" in the Deployments tab
   - OR run the deployment script in Console

3. **Verify deployment:**
   - Test your site
   - Check logs if needed

---

## 📞 Need Help?

If you encounter issues:

1. **Check Forge Logs:**
   - Site → Logs → View Latest Logs

2. **Check Laravel Logs:**
   - Site → Console → `tail -f storage/logs/laravel.log`

3. **Enable Debug Mode Temporarily:**
   - Site → Environment → Set `APP_DEBUG=true`
   - See actual error, fix it, then disable debug

4. **Review Deployment Output:**
   - Site → Deployments → View Output

---

## ✅ Deployment Complete!

Once all steps are completed, your updated system should be live on your server!

**Remember:**
- Keep your `.env` file secure and never commit it
- Always test after deployment
- Monitor logs for any issues
- Keep your dependencies updated

---

**Last Updated:** $(date)
**For:** Restyle10 Deployment to Existing Forge Server


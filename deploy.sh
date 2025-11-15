#!/bin/bash
# Quick Deployment Script for Laravel Forge
# Run this in Forge Console or add to Forge Deployment Script

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Navigate to site directory
# UPDATE THIS PATH to match your Forge site directory
cd /home/forge/your-site-name.com || {
    echo "❌ Error: Could not find site directory. Please update the path in this script."
    exit 1
}

echo "📥 Pulling latest code from repository..."
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

echo "⚡ Rebuilding production caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "🔧 Optimizing autoloader..."
composer dump-autoload --optimize

echo "🔗 Ensuring storage link exists..."
php artisan storage:link || true

echo "✅ Deployment complete!"
echo "🌐 Your site should now be updated with the latest changes."



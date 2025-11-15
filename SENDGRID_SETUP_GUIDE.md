# SendGrid Email Service Setup Guide

## 🎯 Best Practice: Test Locally First!

**Always test email services in localhost before deploying to production.** This helps you:
- Catch configuration errors early
- Avoid sending test emails to real users
- Debug issues in a controlled environment
- Save your SendGrid quota for production use

---

## 📋 Step-by-Step Setup

### Step 1: Get Your SendGrid API Key

1. Sign up/Login at [SendGrid](https://sendgrid.com/)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "ReStyle Local Development")
5. Select **Full Access** or **Restricted Access** (Mail Send permissions)
6. **Copy the API key immediately** (you won't see it again!)

### Step 2: Configure for Localhost Testing

#### Update your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_sendgrid_api_key_here  # Paste your API key here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@restyle10.test"  # Use a test domain for localhost
MAIL_FROM_NAME="${APP_NAME}"

SENDGRID_API_KEY=your_sendgrid_api_key_here
```

**Important Notes:**
- `MAIL_USERNAME` must be exactly `apikey` (not your email)
- `MAIL_PASSWORD` is your SendGrid API key
- Use a test email address for `MAIL_FROM_ADDRESS` in localhost

### Step 3: Test Locally

1. **Clear config cache:**
   ```bash
   php artisan config:clear
   ```

2. **Test using the test route:**
   Visit: `http://restyle10.test/test-email`
   
   Or use the test route in your browser/Postman:
   ```bash
   GET http://restyle10.test/test-email
   ```

3. **Check your email inbox** (the email address you specified in the test route)

4. **Check SendGrid Activity Feed:**
   - Go to SendGrid Dashboard → **Activity**
   - You should see the email delivery status

### Step 4: Test Real Email Features

Test your actual email features:
- Email verification
- Password reset
- Transaction notifications
- Any other email-triggered features

### Step 5: Monitor and Debug

**If emails aren't sending:**

1. **Check Laravel logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Check SendGrid Activity Feed:**
   - Look for failed deliveries
   - Check bounce/spam reports

3. **Common Issues:**
   - ❌ Wrong API key → Check `MAIL_PASSWORD` matches your SendGrid API key
   - ❌ Wrong username → Must be exactly `apikey`
   - ❌ Domain not verified → For production, verify your domain in SendGrid
   - ❌ Rate limits → Free tier has limits (100 emails/day)

---

## 🚀 Production Deployment

### Step 1: Verify Your Domain in SendGrid

1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. Wait for verification (can take 24-48 hours)

### Step 2: Update Production `.env`

On your production server (Laravel Forge, etc.):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_production_sendgrid_api_key  # Use a separate API key for production
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"  # Use your verified domain
MAIL_FROM_NAME="${APP_NAME}"

SENDGRID_API_KEY=your_production_sendgrid_api_key
```

### Step 3: Best Practices for Production

1. **Use a separate API key** for production (different from localhost)
2. **Verify your domain** to improve deliverability
3. **Set up SPF/DKIM records** (SendGrid will guide you)
4. **Monitor SendGrid dashboard** regularly
5. **Set up webhooks** for bounce/spam notifications
6. **Use SendGrid's suppression lists** to manage unsubscribes

### Step 4: Test in Production

1. Send a test email to yourself
2. Check SendGrid Activity Feed
3. Verify email appears in inbox (not spam)
4. Test all email features

---

## 🔧 Alternative: Using SendGrid API (Advanced)

If you prefer using SendGrid's API instead of SMTP:

1. **Install SendGrid package:**
   ```bash
   composer require sendgrid/sendgrid
   ```

2. **Create a custom mail driver** or use a package like `laravel-sendgrid-driver`

3. **Update `config/mail.php`** to use SendGrid API transport

**Note:** SMTP is simpler and works out of the box with Laravel. Only use API if you need advanced features.

---

## 📊 SendGrid Free Tier Limits

- **100 emails/day** (free tier)
- **40,000 emails** for first 30 days (trial)
- Upgrade to paid plans for higher limits

---

## ✅ Checklist

### Localhost Testing:
- [ ] SendGrid account created
- [ ] API key generated and copied
- [ ] `.env` file updated with SendGrid credentials
- [ ] Config cache cleared
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] All email features tested

### Production Deployment:
- [ ] Domain verified in SendGrid
- [ ] SPF/DKIM records configured
- [ ] Production API key created
- [ ] Production `.env` updated
- [ ] Test email sent from production
- [ ] Email deliverability checked
- [ ] Monitoring set up

---

## 🆘 Troubleshooting

### Email not sending:
1. Check API key is correct
2. Verify `MAIL_USERNAME=apikey` (exact spelling)
3. Check SendGrid Activity Feed for errors
4. Verify port 587 is not blocked by firewall
5. Check Laravel logs for errors

### Email going to spam:
1. Verify your domain in SendGrid
2. Set up SPF/DKIM records
3. Use a professional `MAIL_FROM_ADDRESS`
4. Avoid spam trigger words in subject/content

### Rate limit errors:
1. Check your SendGrid plan limits
2. Implement email queuing for bulk sends
3. Consider upgrading your SendGrid plan

---

## 📚 Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Laravel Mail Documentation](https://laravel.com/docs/mail)
- [SendGrid SMTP Settings](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [SendGrid API Keys](https://docs.sendgrid.com/ui/account-and-settings/api-keys)

---

**Remember:** Always test in localhost first! 🧪


# Production Deployment Checklist

## ✅ Completed Automatically

- [x] Removed duplicate `next.config.ts` file
- [x] Using single `next.config.js` configuration

## 🔧 Environment Variables (CRITICAL)

### Required for Production:

Create `.env.production` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Email Service (Resend)
RESEND_API_KEY=your_production_resend_key
EMAIL_FROM=your_verified_email@yourdomain.com

# Node Environment
NODE_ENV=production
```

### ⚠️ Security Checks:

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use different keys for production** - Don't reuse development keys
3. **Enable RLS policies** in Supabase for production database
4. **Set up proper CORS** in Supabase dashboard

## 🛡️ Security Configurations

### Already Implemented:

- ✅ bcrypt password hashing (10 rounds)
- ✅ HTTP-only session cookies
- ✅ Secure cookies in production (automatically enabled)
- ✅ OTP email verification
- ✅ Session token generation with crypto
- ✅ SQL injection protection (via Supabase client)
- ✅ XSS protection (Next.js built-in)

### Recommended Additional Steps:

1. **Rate Limiting**: Add rate limiting to auth endpoints
2. **CSRF Protection**: Consider adding CSRF tokens for sensitive actions
3. **Content Security Policy**: Add CSP headers in next.config.js
4. **HTTPS Only**: Ensure production deployment uses HTTPS

## 📦 Build & Deploy

### 1. Clean Build

```bash
# Remove existing build artifacts
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Fresh install
npm ci

# Build for production
npm run build
```

### 2. Test Production Build Locally

```bash
npm run build
npm start
```

### 3. Deploy Checklist

- [ ] Update environment variables on hosting platform
- [ ] Set NODE_ENV=production
- [ ] Configure custom domain
- [ ] Enable HTTPS/SSL
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure database backups
- [ ] Set up logging service
- [ ] Test all authentication flows
- [ ] Test admin panel access
- [ ] Test cart and checkout
- [ ] Verify email delivery (OTP, forgot password)

## 🗄️ Database Setup

### Supabase Production Database:

1. **Create Tables** - Run these SQL files in order:
   ```sql
   -- From database/schema_users.sql
   -- From database/create_user_sessions.sql (if needed)
   -- From supabase/products-schema.sql
   ```

2. **Enable Row Level Security (RLS)**:
   ```sql
   -- Users table
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Sessions table  
   ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
   
   -- OTP table
   ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
   
   -- Products table
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ```

3. **Create RLS Policies** - Ensure proper access control

4. **Set up automated OTP cleanup**:
   - Create a Supabase Edge Function to call `/api/auth/cleanup-otps`
   - Or set up a cron job to run daily

## 🔍 Monitoring & Logging

### Console Logs in Production:

- `console.error()` statements are kept for error tracking
- `console.log()` debug statements remain for troubleshooting
- Consider integrating with:
  - Sentry for error tracking
  - LogRocket for session replay
  - Datadog or New Relic for APM

### Key Metrics to Monitor:

- Login/Registration success rates
- OTP delivery success rates
- Session creation failures
- API response times
- Cart abandonment rates
- Product views vs purchases

## 🚀 Performance Optimization

### Already Optimized:

- ✅ Next.js Image optimization
- ✅ Lazy loading on images
- ✅ Product data caching via React state
- ✅ Minimal bundle size

### Consider Adding:

- [ ] Redis caching for frequently accessed data
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] API response caching
- [ ] Service Worker for offline support

## 📱 Testing Before Go-Live

### Authentication:
- [ ] Register new user with OTP
- [ ] Login with credentials
- [ ] Forgot password flow
- [ ] Logout functionality
- [ ] Session persistence across page refreshes

### Admin Panel:
- [ ] Admin login
- [ ] Create product with multiple images
- [ ] Edit product
- [ ] Delete product
- [ ] Product listing

### Shopping Experience:
- [ ] Browse products
- [ ] Add to cart
- [ ] Update cart quantities
- [ ] Remove from cart
- [ ] Cart persistence
- [ ] Checkout flow

### Email Delivery:
- [ ] OTP emails arriving
- [ ] Password reset emails arriving
- [ ] Email template formatting
- [ ] Check spam folder

## 🔄 Post-Deployment

1. **Monitor Error Logs** - First 24-48 hours are critical
2. **Check Database Performance** - Watch for slow queries
3. **Verify Email Delivery Rate** - Ensure Resend quota is sufficient
4. **Test on Multiple Devices** - Mobile, tablet, desktop
5. **Test on Multiple Browsers** - Chrome, Firefox, Safari, Edge
6. **Load Testing** - Use tools like Artillery or k6

## 📚 Documentation

- Keep `.env.example` updated with all required variables
- Document any manual database setup steps
- Create runbook for common issues
- Document backup and recovery procedures

## 🆘 Emergency Procedures

### If Site Goes Down:

1. Check hosting platform status
2. Verify environment variables are set
3. Check database connection
4. Review recent code changes
5. Check error logs
6. Rollback to previous working version if needed

### If Authentication Fails:

1. Verify Supabase connection
2. Check service role key is set
3. Verify user_sessions table exists
4. Check RLS policies aren't blocking access

### If Emails Aren't Sending:

1. Verify RESEND_API_KEY is set
2. Check Resend dashboard for quota/errors
3. Verify EMAIL_FROM is verified in Resend
4. Check email isn't going to spam

---

## 📝 Quick Deploy Commands

```bash
# For Vercel
vercel --prod

# For Netlify
netlify deploy --prod

# For custom server
npm run build
pm2 start npm --name "web1" -- start
```

## ✨ Final Checks

- [ ] All environment variables set
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Email service configured
- [ ] Admin account created
- [ ] Test products added
- [ ] All authentication flows tested
- [ ] Payment integration tested (if applicable)
- [ ] Error monitoring configured
- [ ] Backup strategy in place

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0

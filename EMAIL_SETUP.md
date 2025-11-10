# Email Verification Setup

## Overview
The registration process now includes a 3-step email verification:
1. **Enter Email** - User provides their email address
2. **Verify OTP** - A 6-digit code is sent to the email
3. **Complete Registration** - After verification, user enters name and password

## Database Setup

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otp_email ON otp_verifications(email);
CREATE INDEX idx_otp_email_otp ON otp_verifications(email, otp);
```

## Email Service Options

### Option 1: Resend (Recommended for Production)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
   EMAIL_FROM=onboarding@yourdomain.com
   ```

### Option 2: Development Mode (Console Logging)

If `RESEND_API_KEY` is not set, the OTP will be logged to the server console. This is perfect for development and testing.

**To see the OTP during development:**
1. Start your dev server: `npm run dev`
2. Register with an email
3. Check the terminal/console output
4. You'll see: `🔐 OTP for user@example.com: 123456`

## Testing the Flow

1. Go to `/register`
2. Enter your email
3. Click "Send Verification Code"
4. Check console (dev) or email (production) for OTP
5. Enter the 6-digit code
6. Complete registration with name and password

## Features

- ✅ 6-digit OTP codes
- ✅ 10-minute expiration
- ✅ One-time use (prevents reuse)
- ✅ Resend capability
- ✅ Email validation before sending
- ✅ Duplicate email detection
- ✅ 30-minute window to complete registration after OTP verification

## API Endpoints

- `POST /api/auth/send-otp` - Send verification code
- `POST /api/auth/verify-otp` - Verify the code
- `POST /api/auth/register` - Complete registration (requires verified OTP)

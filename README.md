# Looms & Petals - E-Commerce Platform

A production-ready e-commerce platform built with Next.js 16, Supabase, and custom authentication.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase and Resend credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Clean and build for production
npm run build:prod

# Test production build locally
npm start

# Or use PowerShell script
.\build-production.ps1
```

## 📦 Features

- ✅ User authentication with OTP email verification
- ✅ Forgot password flow with OTP reset
- ✅ Shopping cart with size/color variants
- ✅ Admin panel for product management
- ✅ Multiple product images support
- ✅ Stock management and validation
- ✅ Product categories and status (trending, featured, sale)
- ✅ Secure password hashing with bcrypt
- ✅ Session management with HTTP-only cookies

## 📋 Documentation

- **[Production Checklist](PRODUCTION_CHECKLIST.md)** - Complete deployment guide
- **[Cleanup Notes](CLEANUP_NOTES.md)** - Package optimization
- **[Environment Setup](.env.example)** - Required environment variables

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **Supabase** - PostgreSQL database
- **bcryptjs** - Password hashing
- **Resend** - Email service
- **React Bootstrap** - UI components
- **TypeScript** - Type safety

## 📁 Key Directories

```
app/
├── api/auth/          # Authentication endpoints
├── api/admin/         # Admin panel API
├── components/        # Reusable components
├── context/           # Auth & Cart context
└── admin/             # Admin dashboard

database/              # SQL schemas
supabase/              # Supabase configs
```

## 🔐 Security Features

- bcrypt password hashing (10 rounds)
- HTTP-only session cookies
- OTP email verification
- Service role key for admin operations
- SQL injection protection (via Supabase)
- XSS protection (Next.js built-in)

## 🧪 Pre-Deployment Testing

Before deploying to production, test:

1. User registration with OTP
2. Login/logout functionality
3. Forgot password flow
4. Admin panel access
5. Product CRUD operations
6. Shopping cart functionality
7. Email delivery (check spam folder)

## 📝 Environment Variables

Required variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`

## 🚀 Deployment

**Vercel (Recommended)**
```bash
vercel --prod
```

**Netlify**
```bash
netlify deploy --prod
```

See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for complete deployment guide.

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)

---

**Built with Next.js** | **Database by Supabase** | **Emails by Resend**

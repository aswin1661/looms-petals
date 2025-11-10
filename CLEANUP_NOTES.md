# Package Cleanup Notes

## Potentially Unused Dependencies

### 1. bcrypt (v6.0.0)
- **Status**: Duplicate with bcryptjs
- **Recommendation**: Remove `bcrypt`, keep only `bcryptjs`
- **Why**: You're using bcryptjs in all auth routes
- **Command**: `npm uninstall bcrypt`

### 2. mongoose (v8.19.3)
- **Status**: Not used (using Supabase instead)
- **Recommendation**: Remove unless you plan to use MongoDB
- **Command**: `npm uninstall mongoose`

### 3. dotenv (v17.2.3)
- **Status**: Not needed in Next.js
- **Recommendation**: Remove (Next.js handles .env files automatically)
- **Command**: `npm uninstall dotenv`

## Cleanup Commands

Run these commands to remove unused packages:

```bash
npm uninstall bcrypt mongoose dotenv
```

This will:
- Remove ~50MB from node_modules
- Speed up installation time
- Reduce bundle size
- Eliminate confusion between bcrypt/bcryptjs

## Dependencies to Keep

✅ **@supabase/supabase-js** - Database client
✅ **bcryptjs** - Password hashing (used throughout)
✅ **bootstrap** - UI framework (used in components)
✅ **next** - Framework
✅ **react** - Core library
✅ **react-bootstrap** - Bootstrap components
✅ **react-dom** - React DOM rendering
✅ **resend** - Email service

## Dev Dependencies - All Good

All dev dependencies are being used and necessary.

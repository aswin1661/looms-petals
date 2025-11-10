# Looms & Petals - Admin Panel

Professional e-commerce platform with secure admin panel for managing products.

## 🔐 Admin Access

**Login URL:** `/admin/login`

### Default Credentials
- **Email:** `admin@example.com`
- **Password:** Contact system administrator

## 🚀 Features

### Security
- ✅ Bcrypt password hashing (12 salt rounds)
- ✅ Secure session management with HTTP-only cookies
- ✅ 24-hour session expiration
- ✅ Row Level Security (RLS) on database
- ✅ Service role authentication for admin operations
- ✅ Input validation and sanitization

### Product Management
- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Product categorization (Sarees, Lehengas, Jewelry, Accessories)
- ✅ Product types (Clothing, Jewelry, Accessories, Footwear)
- ✅ Status management (Normal, Trending, Featured, Most Bought, New Arrival, Sale)
- ✅ Stock management
- ✅ Image upload support
- ✅ Price and discount pricing
- ✅ Featured product toggle

## 📦 Database Schema

### Tables
- **users** - Admin and customer accounts
- **admin_sessions** - Secure admin session storage
- **products** - Product catalog with full details

## 🛠️ Setup

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup
1. Run `supabase/complete-setup.sql` for users and sessions tables
2. Run `supabase/create-products-table.sql` for products table
3. Run `supabase/add-status-type-columns.sql` for additional product fields

### Creating Admin Users
Use `scripts/hashPassword.js` to generate secure password hashes:
```bash
node scripts/hashPassword.js your_password
```

Then insert into database:
```sql
INSERT INTO users (name, email, password, role, is_verified) VALUES
('Admin Name', 'admin@example.com', 'generated_hash', 'admin', true);
```

## 🎨 Admin Dashboard

### Features
- Real-time product grid view
- Modal-based product creation/editing
- Instant product deletion with confirmation
- Responsive design for all screen sizes
- Professional maroon and gold color scheme

## 🔒 API Security

All admin API routes require:
1. Valid session token in HTTP-only cookie
2. Admin role verification
3. Session expiration check
4. Database-level RLS policies

## 📝 License

Private and Confidential - All Rights Reserved

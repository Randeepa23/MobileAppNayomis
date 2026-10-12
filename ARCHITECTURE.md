# Admin System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Nayomi's Food App                            │
│                  Complete System Architecture                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│                          │         │                          │
│    USER FLOW             │         │    ADMIN FLOW           │
│    (Regular Customers)   │         │    (Restaurant Admins)  │
│                          │         │                          │
└──────────────────────────┘         └──────────────────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                     ┌─────────────┐
    │   Main Site │                     │/admin/login │
    │      /      │                     │   Portal    │
    └─────────────┘                     └─────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                     ┌─────────────┐
    │ User Login  │                     │ Admin Login │
    │  /Register  │                     │   Form      │
    └─────────────┘                     └─────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                     ┌─────────────┐
    │ User Auth   │                     │ Admin Auth  │
    │  Context    │                     │  Context    │
    └─────────────┘                     └─────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                     ┌─────────────┐
    │  API Call   │                     │  API Call   │
    │   POST      │                     │   POST      │
    │/students/   │                     │/admin-auth/ │
    │   login     │                     │   login     │
    └─────────────┘                     └─────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                     ┌─────────────┐
    │  Database   │                     │ Environment │
    │   MongoDB   │                     │    .env     │
    │  Students   │                     │  Variables  │
    └─────────────┘                     └─────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                     ┌─────────────┐
    │  JWT Token  │                     │  JWT Token  │
    │(7 day exp)  │                     │(12 hour exp)│
    └─────────────┘                     └─────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                     ┌─────────────┐
    │localStorage │                     │localStorage │
    │nayomis_user │                     │nayomis_admin│
    │            │                     │    _token   │
    └─────────────┘                     └─────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                     ┌─────────────┐
    │   User      │                     │   Admin     │
    │  Dashboard  │                     │  Dashboard  │
    │             │                     │             │
    │ • Profile   │                     │ • Orders    │
    │ • Orders    │                     │ • Menu      │
    │ • Loyalty   │                     │ • Stats     │
    │ • Reviews   │                     │ • Students  │
    │             │                     │ • Reviews   │
    └─────────────┘                     └─────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   COMPLETE SEPARATION                            │
│ • Different routes                                               │
│ • Different API endpoints                                        │
│ • Different authentication systems                               │
│ • Different storage keys                                         │
│ • Different token types and expiration                           │
│ • No overlap or interference                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow Details

### User Authentication Flow
```
1. User visits main site (/)
2. Clicks "Sign In" button
3. Opens AuthForm dialog
4. Enters email & password
5. POST /api/students/login
6. Backend checks MongoDB database
7. Returns JWT token (7 days) + user data
8. Store in localStorage as 'nayomis_user'
9. AuthContext sets user state
10. User accesses dashboard and features
```

### Admin Authentication Flow
```
1. Admin visits /admin/login
2. Sees dedicated admin login page
3. Enters admin email & password
4. POST /api/admin-auth/login
5. Backend checks .env variables
6. Compares password with bcrypt hash
7. Returns JWT token (12 hours) + admin data
8. Store in localStorage as 'nayomis_admin_token'
9. AdminAuthContext sets admin state
10. Admin accesses admin dashboard
```

---

## Token Structure

### User Token (JWT)
```json
{
  "studentId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1235172690
}
```
- Issued by: `/api/students/login`
- Expiration: 7 days
- Stored as: `nayomis_user`
- Used for: User features

### Admin Token (JWT)
```json
{
  "email": "admin@nayomis.com",
  "type": "admin",
  "timestamp": 1234567890,
  "iat": 1234567890,
  "exp": 1234610890
}
```
- Issued by: `/api/admin-auth/login`
- Expiration: 12 hours
- Stored as: `nayomis_admin_token`
- Used for: Admin features
- Type field: 'admin' (for verification)

---

## Route Protection

### User Routes
```typescript
// Not protected (public)
/ - Main site
/pre-order - Pre-order page

// Protected (requires user auth)
/dashboard - User dashboard
```

### Admin Routes
```typescript
// Not protected (public)
/admin/login - Admin login page

// Protected (requires admin auth)
/admin - Admin dashboard
/admin/dashboard - Admin dashboard (alias)
```

### Protection Mechanism
```typescript
// User Protection (in AuthContext)
if (!isAuthenticated) {
  // Show login dialog or redirect
}

// Admin Protection (in ProtectedAdminRoute)
if (!isAdminAuthenticated) {
  return <Navigate to="/admin/login" />;
}
```

---

## Backend Endpoints

### User Endpoints (Existing)
```
POST   /api/students/register    - Register new user
POST   /api/students/login        - Login user
GET    /api/students/profile      - Get user profile
PUT    /api/students/profile      - Update profile
```

### Admin Auth Endpoints (NEW)
```
POST   /api/admin-auth/login      - Admin login
GET    /api/admin-auth/verify     - Verify admin token
```

### Admin Operations Endpoints (Existing)
```
GET    /api/admin/stats           - Dashboard stats
GET    /api/admin/orders          - All orders
GET    /api/admin/students        - All students
PATCH  /api/orders/:id/status     - Update order
POST   /api/food                  - Create food item
PUT    /api/food/:id              - Update food item
DELETE /api/food/:id              - Delete food item
```

---

## Data Storage

### User Data
```
Database: MongoDB
Collection: students
Fields:
  - name
  - email
  - password (hashed)
  - studentId
  - phone
  - createdAt
  - updatedAt
```

### Admin Data
```
Storage: Environment Variables (.env)
Fields:
  - ADMIN_EMAIL=admin@nayomis.com
  - ADMIN_PASSWORD=$2a$10$... (bcrypt hash)
```

### Session Storage
```
User Session:
  - localStorage.nayomis_user = {token, user data}
  
Admin Session:
  - localStorage.nayomis_admin_token = "jwt_token"
  - localStorage.nayomis_admin_email = "admin@nayomis.com"
```

---

## Security Layers

```
┌─────────────────────────────────────────────┐
│ Layer 1: Environment Variables              │
│ • Admin credentials in .env (not in code)   │
│ • Not committed to git                      │
│ • Server-side only                          │
└─────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────┐
│ Layer 2: Password Hashing                   │
│ • Bcrypt with 10 rounds                     │
│ • One-way hashing                           │
│ • Salted                                    │
└─────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────┐
│ Layer 3: JWT Tokens                         │
│ • Signed with secret key                    │
│ • Time-limited expiration                   │
│ • Type checking                             │
└─────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────┐
│ Layer 4: Route Protection                   │
│ • Frontend guards                           │
│ • Backend middleware                        │
│ • Token verification                        │
└─────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────┐
│ Layer 5: Separation of Concerns             │
│ • Different auth contexts                   │
│ • Different storage keys                    │
│ • No shared credentials                     │
└─────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Frontend Structure
```
App.tsx
├── AuthProvider (User authentication)
│   ├── AdminAuthProvider (Admin authentication)
│   │   ├── CartProvider
│   │   │   ├── TooltipProvider
│   │   │   │   ├── Router
│   │   │   │   │   ├── / (Index)
│   │   │   │   │   │   └── ModernNavigation
│   │   │   │   │   │       ├── AuthForm (User login/register)
│   │   │   │   │   │       └── CartSidebar
│   │   │   │   │   ├── /dashboard (Protected by user auth)
│   │   │   │   │   ├── /pre-order
│   │   │   │   │   ├── /admin/login (Public)
│   │   │   │   │   │   └── AdminLogin
│   │   │   │   │   └── /admin (Protected by admin auth)
│   │   │   │   │       └── ProtectedAdminRoute
│   │   │   │   │           └── AdminDashboard
```

---

## File Organization

### Backend Structure
```
backend/
├── server.js (Main entry, admin auth route registered)
├── .env (Admin credentials)
├── config/
│   └── db.js
├── models/
│   ├── Student.js (User model)
│   ├── FoodItem.js
│   └── Order.js
├── controllers/
│   ├── studentController.js (User auth)
│   └── adminController.js (Admin operations)
├── routes/
│   ├── studentRoutes.js (User endpoints)
│   ├── adminRoutes.js (Admin operations)
│   └── adminAuthRoutes.js ⭐ NEW (Admin auth)
└── scripts/
    ├── generateAdminPassword.js ⭐ NEW
    └── testAdminAuth.js ⭐ NEW
```

### Frontend Structure
```
src/
├── App.tsx (Updated with admin routes)
├── contexts/
│   ├── AuthContext.tsx (User auth)
│   └── AdminAuthContext.tsx ⭐ NEW (Admin auth)
├── pages/
│   ├── Index.tsx (Main site)
│   ├── Dashboard.tsx (User dashboard)
│   ├── AdminLogin.tsx ⭐ NEW (Admin login)
│   └── AdminDashboard.tsx (Admin dashboard - updated)
└── components/
    ├── navigation/
    │   └── ModernNavigation.tsx (Updated - removed admin)
    └── admin/
        ├── ProtectedAdminRoute.tsx (Updated)
        └── AdminDashboard.tsx (Updated with logout)
```

---

## Migration Path (Old → New)

### What Changed
```
❌ OLD: Role-Based System
User Model: { name, email, password, role: 'user'|'admin' }
Single Auth: User login checks role field
Single Context: AuthContext with role checking
Navigation: Conditional rendering based on role
Access: Users with role='admin' see admin features

✅ NEW: Separate Portal System
User Model: { name, email, password } (role unused)
Admin Creds: Environment variables (.env)
Dual Auth: User login + separate admin login
Dual Context: AuthContext + AdminAuthContext
Navigation: Clean user nav, separate admin portal
Access: Completely independent admin system
```

### What Stayed the Same
```
✅ User registration - No changes
✅ User login - Works exactly as before
✅ User dashboard - No changes
✅ User features - All unchanged
✅ Admin operations - Same endpoints
✅ Database structure - Compatible
```

---

## Testing Checklist

### Backend Tests
```bash
# Start server
cd backend
node server.js

# Should see:
# "Server running on port 5000"
# "MongoDB Connected: localhost"

# Test admin login
node scripts/testAdminAuth.js

# Should see:
# "✅ Admin Login Successful!"
# "✅ Token Verification Successful!"
```

### Frontend Tests
```bash
# Start frontend
npm run dev

# Should compile without errors
```

### Manual Tests
- [ ] Visit / - Main site loads
- [ ] User can login/register
- [ ] Visit /admin/login - Admin login page loads
- [ ] Admin can login with credentials
- [ ] Admin dashboard loads
- [ ] Admin can logout
- [ ] Visit /admin without auth - Redirects to login
- [ ] User dropdown doesn't show admin options

---

## Quick Reference

### Default Admin Credentials
```
URL: http://localhost:8080/admin/login
Email: admin@nayomis.com
Password: admin123
```

### Change Password
```bash
cd backend
node scripts/generateAdminPassword.js NewPassword
# Copy hash to backend/.env ADMIN_PASSWORD
```

### Environment Variables
```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/nayomis-food-app
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
ADMIN_EMAIL=admin@nayomis.com
ADMIN_PASSWORD=$2a$10$... (bcrypt hash)
```

---

**Architecture Version**: 2.0 (Separate Admin Portal)  
**Last Updated**: December 2024  
**Status**: Production Ready

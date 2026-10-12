# Quick Setup Guide - New Admin System

## What Changed?
The admin system has been completely refactored:
- ❌ Removed role-based admin authentication
- ✅ Added separate admin portal with dedicated login
- ✅ Environment-based credentials (no database dependency)
- ✅ Complete separation from user authentication

## Setup Steps

### 1. Backend Setup

#### Update Environment Variables
The `backend/.env` file already has the admin credentials:
```env
ADMIN_EMAIL=admin@nayomis.com
ADMIN_PASSWORD=$2a$10$Mh0ZI/raW9qfTeoGQ9J80e1/lGYkBdMBrnjn9iqI2yZC3noHymQ/i
```

Default password is: **admin123**

#### Start Backend Server
```bash
cd backend
npm start
# or
node server.js
```

The backend will now have these new endpoints:
- `POST /api/admin-auth/login` - Admin login
- `GET /api/admin-auth/verify` - Verify admin token

### 2. Frontend Setup

The frontend has been updated with:
- New `AdminAuthContext` for admin authentication
- New `AdminLogin` page at `/admin/login`
- Updated `ProtectedAdminRoute` to use admin tokens
- Updated routing in `App.tsx`

#### Start Frontend
```bash
npm run dev
```

### 3. Access Admin Portal

1. Open your browser
2. Navigate to: `http://localhost:8080/admin/login`
3. Enter credentials:
   - **Email**: `admin@nayomis.com`
   - **Password**: `admin123`
4. Click "Sign In to Admin Portal"
5. You'll be redirected to the admin dashboard

## Verification

### Test Admin Login
```bash
# From your terminal (optional)
curl -X POST http://localhost:5000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nayomis.com","password":"admin123"}'

# Should return:
# {
#   "message": "Admin login successful",
#   "token": "...",
#   "admin": {
#     "email": "admin@nayomis.com",
#     "type": "admin"
#   }
# }
```

## User Experience

### For Regular Users
- **No changes** - Users continue to use the main site
- User login/registration works exactly as before
- Users cannot access admin features

### For Admins
- Visit `/admin/login` for dedicated admin portal
- Completely separate from user authentication
- 12-hour session duration
- Logout button in admin dashboard

## Important Notes

1. **No Database Changes Required**: Admin credentials are in `.env`, not in the database
2. **User Flow Unchanged**: Regular users are not affected by these changes
3. **Existing User Data**: All user data remains intact (the role field is simply unused now)
4. **Clean Separation**: Admin and user authentication are completely independent

## Changing the Admin Password

If you want to change the admin password:

```bash
# Generate new password hash
cd backend
node scripts/generateAdminPassword.js YourNewPassword

# Copy the generated hash
# Update ADMIN_PASSWORD in backend/.env
# Restart backend server
```

## Troubleshooting

### Backend Not Starting
- Check if MongoDB is running: `mongod --version`
- Check if port 5000 is available
- Look for errors in terminal

### Cannot Login to Admin
- Verify backend is running on `http://localhost:5000`
- Check `backend/.env` has ADMIN_EMAIL and ADMIN_PASSWORD
- Try regenerating the password hash
- Clear browser localStorage: `localStorage.clear()`

### 404 on /admin/login
- Make sure frontend is running: `npm run dev`
- Check that App.tsx has the /admin/login route
- Try clearing browser cache

## Next Steps

✅ **Change the default password** (especially for production!)
✅ Test all admin features
✅ Review the comprehensive documentation in `ADMIN_PORTAL.md`

---

**Need Help?** Check `ADMIN_PORTAL.md` for detailed documentation.

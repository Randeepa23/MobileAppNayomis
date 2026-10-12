# Admin Access Documentation

## Overview
The admin system is now completely separate from the regular user authentication system. Admins have their own dedicated login portal and authentication mechanism.

## Admin Credentials
- **Admin Portal URL**: `http://localhost:8080/admin/login` (or your deployed URL)
- **Default Email**: `admin@nayomis.com`
- **Default Password**: `admin123`

⚠️ **IMPORTANT**: Change the default password immediately in production!

## How to Access Admin Panel

### Step 1: Navigate to Admin Login
Go to: `http://localhost:8080/admin/login`

### Step 2: Login with Admin Credentials
- Email: `admin@nayomis.com`
- Password: `admin123`

### Step 3: Access Admin Dashboard
After successful login, you'll be redirected to `/admin/dashboard` where you can:
- View and manage all orders
- Manage food items and menu
- View customer reviews
- Manage student/customer accounts
- Access loyalty program data

## Key Features

### Separate Authentication
- Admin login is completely independent from user login
- Users cannot access admin features
- Admins have their own dedicated portal

### Environment-Based Credentials
- Admin credentials are stored securely in the `.env` file
- No database dependency for admin authentication
- Credentials are hashed using bcrypt

### Protected Routes
All admin routes (`/admin/*`) are protected and require admin authentication:
- `/admin/login` - Admin login page (public)
- `/admin` - Admin dashboard (protected)
- `/admin/dashboard` - Admin dashboard (protected)

## Changing Admin Password

### Method 1: Using the Script
1. Navigate to the backend directory
2. Run: `node scripts/generateAdminPassword.js YourNewPassword`
3. Copy the generated hash
4. Update `ADMIN_PASSWORD` in `backend/.env` with the new hash
5. Restart the backend server

### Method 2: Manual
1. Generate a bcrypt hash of your desired password
2. Update `ADMIN_PASSWORD` in `backend/.env`
3. Restart the backend server

## Architecture

### Backend Components
- **Route**: `/api/admin-auth/login` - Admin authentication endpoint
- **Route**: `/api/admin-auth/verify` - Token verification endpoint
- **Environment Variables**:
  - `ADMIN_EMAIL` - Admin email address
  - `ADMIN_PASSWORD` - Bcrypt hashed admin password

### Frontend Components
- **AdminAuthContext**: Manages admin authentication state
- **AdminLogin**: Dedicated admin login page
- **ProtectedAdminRoute**: Route guard for admin pages
- **AdminDashboard**: Main admin interface

### Token Management
- Admin tokens are stored in `localStorage` with key `nayomis_admin_token`
- Tokens expire after 12 hours
- Tokens are automatically verified on protected route access

## Security Features

1. **Bcrypt Password Hashing**: Passwords are hashed with 10 salt rounds
2. **JWT Tokens**: Secure token-based authentication with expiration
3. **Environment Variables**: Sensitive credentials stored in .env (not in code)
4. **Route Protection**: All admin routes require valid admin token
5. **Token Verification**: Automatic verification on each protected route access

## Troubleshooting

### Cannot Login to Admin Portal
1. Verify the backend server is running (`http://localhost:5000`)
2. Check that `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `backend/.env`
3. Ensure the password hash is correct (regenerate if needed)
4. Check browser console for error messages

### Admin Token Expired
- Admin tokens expire after 12 hours
- Simply login again to get a new token

### Forgot Admin Password
1. Run: `node scripts/generateAdminPassword.js YourNewPassword`
2. Update the hash in `backend/.env`
3. Restart the backend server

## Development Notes

### Testing Admin Authentication
```bash
# Test admin login
curl -X POST http://localhost:5000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nayomis.com","password":"admin123"}'

# Test token verification
curl http://localhost:5000/api/admin-auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Adding More Admin Users
To add multiple admin accounts:
1. Create additional environment variables (e.g., `ADMIN2_EMAIL`, `ADMIN2_PASSWORD`)
2. Update the backend route to check against multiple credentials
3. Or implement a database-based multi-admin system

## Production Deployment

### Before Deploying:
1. ✅ Change default admin password
2. ✅ Use strong, unique password (min 12 characters)
3. ✅ Set secure `JWT_SECRET` in environment
4. ✅ Enable HTTPS on your server
5. ✅ Add rate limiting to prevent brute force attacks
6. ✅ Set up monitoring for admin login attempts
7. ✅ Regularly rotate admin password

### Environment Variables for Production:
```env
ADMIN_EMAIL=your-secure-admin@nayomis.com
ADMIN_PASSWORD=<bcrypt_hash_of_strong_password>
JWT_SECRET=<long_random_secure_secret>
```

## Support
For issues or questions about admin access, refer to this documentation or contact the development team.

---

**Last Updated**: December 2024
**Version**: 2.0 (Separate Admin Portal)

# Admin Access Guide

## Professional Role-Based Authentication System

This application now uses **JWT-based role authentication** instead of checking email patterns. This is the industry-standard approach for securing admin access.

## 🔐 How It Works

### Backend Security
- User model includes a `role` field: `'user'` or `'admin'`
- JWT tokens include the user's role
- All new registrations default to `'user'` role
- Admin access requires `role: 'admin'` in the database

### Frontend Protection
- Admin routes check `user.role === 'admin'`
- Non-admin users are redirected to home page
- No email pattern checking (unprofessional and insecure)

## 📝 Creating an Admin User

### Option 1: Create Default Admin Account
Run this command in the `backend` folder:

```bash
npm run create-admin
```

This creates an admin account with:
- **Email**: admin@nayomis.com
- **Password**: admin123
- **Role**: admin

⚠️ **Important**: Change the password after first login!

### Option 2: Promote Existing User to Admin
If you already have a user account and want to make it admin:

```bash
npm run promote-admin user@example.com
```

Replace `user@example.com` with the actual email address.

### Option 3: Manual Database Update
Using MongoDB Compass or any MongoDB client:

```javascript
db.students.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## 🚀 Accessing Admin Dashboard

1. **Start both servers**:
   - Backend: `cd backend && npm run dev` (port 5000)
   - Frontend: `npm run dev` (port 8080 or 5173)

2. **Login with admin credentials**:
   - Go to `http://localhost:8080/`
   - Click "Sign In"
   - Use admin email and password

3. **Access admin panel**:
   - Navigate to `http://localhost:8080/admin`
   - Or click "Admin Panel" in the user dropdown menu

## 📊 Admin Dashboard Features

Once logged in as admin, you can:

- **Dashboard**: View statistics (total users, orders, revenue)
- **Students**: Manage all registered users
- **Orders**: View and manage all customer orders
- **Reviews**: Moderate customer reviews
- **Loyalty**: View loyalty points reports

## 🔒 Security Benefits

### ✅ Professional Approach (Current Implementation)
- Role stored in database
- Role included in JWT token
- Validated on every request
- Cannot be guessed or exploited
- Follows industry standards
- Suitable for production

### ❌ Previous Approach (Removed)
- Checked if email contains "admin"
- Anyone could register admin123@gmail.com
- Unprofessional and insecure
- Would fail security audits
- Not suitable for production

## 🛠️ Technical Implementation

### Database Schema
```javascript
{
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }
}
```

### JWT Token Payload
```javascript
{
  studentId: "...",
  email: "...",
  role: "admin"
}
```

### Frontend Role Check
```typescript
const isAdmin = user?.role === 'admin';
```

## 📌 Important Notes

1. **Default Role**: All new registrations automatically get `role: 'user'`
2. **Admin Creation**: Only through scripts or direct database update
3. **Security**: Admin role cannot be set through registration form
4. **Token Expiry**: JWT tokens expire after 24 hours
5. **Re-login Required**: After promoting to admin, user must log out and log in again

## 🐛 Troubleshooting

### Cannot access /admin page
- Ensure you're logged in
- Check that your account has `role: 'admin'` in the database
- Try logging out and logging back in
- Clear browser cache and localStorage

### "Access Denied" message
- Your account role is 'user', not 'admin'
- Run promotion script or create new admin account

### Backend not responding
- Ensure MongoDB is running
- Check backend server is running on port 5000
- Verify .env configuration

## 📚 Additional Scripts

View all users and their roles:
```bash
# In backend folder
node -e "require('./scripts/checkUser.js')"
```

Reset all users (development only):
```bash
npm run reset-users
```

## 🎓 Production Deployment

For production deployment:
1. Use environment variables for admin credentials
2. Implement password change on first login
3. Add two-factor authentication
4. Enable audit logging for admin actions
5. Use HTTPS for all communications
6. Regularly rotate JWT secrets

---

**This implementation follows industry best practices and is suitable for production use.**

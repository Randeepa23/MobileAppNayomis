# 🔐 Admin Access - Quick Reference

## Access Admin Portal

**URL**: `http://localhost:8080/admin/login`

**Credentials**:
- Email: `admin@nayomis.com`
- Password: `admin123`

⚠️ **Change password before deploying to production!**

## Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   node server.js
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

3. **Login**:
   - Open: `http://localhost:8080/admin/login`
   - Enter credentials above
   - Access admin dashboard

## What You Can Do

- 📊 View dashboard statistics
- 🛒 Manage all orders
- 🍕 Add/edit/delete menu items
- 👥 View customer accounts
- ⭐ Manage reviews
- 🎁 Track loyalty program

## Change Password

```bash
cd backend
node scripts/generateAdminPassword.js YourNewPassword
```

Copy the generated hash to `backend/.env` file as `ADMIN_PASSWORD`

## Documentation

- 📖 **Full Guide**: See `ADMIN_PORTAL.md`
- 🚀 **Setup Guide**: See `SETUP_ADMIN.md`
- 📋 **Technical Details**: See `REFACTORING_SUMMARY.md`

## Troubleshooting

**Can't login?**
- Verify backend is running on port 5000
- Check credentials in `backend/.env`
- Clear browser localStorage: `localStorage.clear()`

**404 error?**
- Make sure frontend is running: `npm run dev`
- Check URL: Should be `/admin/login` not `/admin-login`

---

**Need Help?** Check the full documentation files listed above.

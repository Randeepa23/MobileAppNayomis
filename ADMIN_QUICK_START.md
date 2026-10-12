# 🚀 Quick Start: Admin Dashboard Access

## ⚡ Fastest Way to Access Admin Dashboard

### Step 1: Check if Admin Account Exists
```bash
cd backend
node scripts/adminAccess.js
```

This will show you:
- ✅ All existing admin accounts
- 🔗 Login URL
- 📋 Access instructions

---

### Step 2: Create Admin Account (If Needed)

**Interactive Method (Recommended):**
```bash
cd backend
node scripts/createAdminInteractive.js
```

Follow the prompts to create your admin account.

**Quick Method:**
```bash
cd backend
node scripts/createAdmin.js
```

Default credentials:
- Email: `admin@nayomis.com`
- Password: Check the script output

---

### Step 3: Start Your Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

### Step 4: Login to Dashboard

1. Open browser: **http://localhost:5173/admin/login**
2. Enter your admin credentials
3. Click "Sign In"
4. You'll be redirected to: **http://localhost:5173/admin/dashboard**

---

## 🎯 What You Can Do in Admin Dashboard

### **📊 Overview Tab**
- View real-time statistics
- Monitor recent orders
- See top customers
- Track revenue and growth

### **🛒 Orders Tab**
- View all customer orders
- Filter by status: Pending, Preparing, Ready, Delivered
- Search by order ID or customer name
- Quick status updates with one-click buttons
- Export orders to CSV

### **👥 Customers Tab**
- View all registered customers
- See loyalty points
- Track order history
- View contact information
- Export customer data

### **🍽️ Menu Tab**
- Manage menu items
- Add new food items
- Update availability
- View all products by category

---

## 📤 How to Send/Retrieve Customer Data

### **Automatic Updates to Customers:**
When you change an order status, customers receive automatic notifications:

1. **Pending → Preparing**: Customer notified their order is being prepared
2. **Preparing → Ready**: Customer notified order is ready for pickup
3. **Ready → Delivered**: Order marked as complete

### **Export Customer Orders:**
```
Dashboard → Orders Tab → Apply Filters → Click "Export Orders"
```

This creates a CSV file with:
- Order ID
- Customer name
- Items ordered
- Total amount
- Order status
- Order date

### **Export Customer List:**
```
Dashboard → Customers Tab → Click Export
```

This creates a CSV file with:
- Customer name
- Email address
- Phone number
- Loyalty points
- Total orders
- Registration date

### **View Specific Customer Orders:**
1. Go to **Orders Tab**
2. Type customer name in search box
3. View all their orders
4. Click any order to see detailed items

---

## 🔄 Real-Time Data Features

Your admin dashboard automatically refreshes:
- **Statistics**: Every 30 seconds
- **Orders**: Every 10 seconds
- **Customers**: Every 15 seconds

Or click the **"Refresh"** button for instant updates!

---

## 📋 Daily Workflow Example

### **Morning (9:00 AM):**
1. Login to dashboard
2. Check "Pending Orders" card
3. Review any overnight orders
4. Update menu availability if needed

### **During Service (11:00 AM - 2:00 PM):**
1. Monitor new orders (auto-updating)
2. Click "Start Preparing" for pending orders
3. Click "Mark Ready" when food is ready
4. Click "Mark Delivered" after customer pickup

### **End of Day (6:00 PM):**
1. Complete all remaining orders
2. Click "Export Orders" → Select "Today"
3. Download CSV for daily report
4. Review revenue statistics

---

## 🎨 Dashboard Features

### **Beautiful UI:**
- ✅ Gradient header with stats
- ✅ Color-coded order statuses
- ✅ Animated cards and transitions
- ✅ Responsive design (works on tablets/phones)
- ✅ Real-time updates
- ✅ Quick action buttons

### **Smart Filtering:**
- ✅ Search orders by ID or customer name
- ✅ Filter by order status
- ✅ Filter by date (Today, Week, Month, All)
- ✅ Combine multiple filters

### **Data Export:**
- ✅ Export orders to CSV
- ✅ Export customer data
- ✅ Open in Excel/Google Sheets
- ✅ Respects your current filters

---

## 🔒 Security Tips

1. **Never share your admin password**
2. **Always logout when finished**
3. **Use a strong password** (minimum 8 characters)
4. **Change password regularly**
5. **Access only from secure networks**

---

## 🆘 Troubleshooting

### **Can't login?**
```bash
# Verify admin account exists
node scripts/adminAccess.js

# Reset password if needed
node scripts/resetAdminPassword.js
```

### **Dashboard not loading data?**
1. Check backend server is running on port 5000
2. Check frontend is running on port 5173
3. Click the "Refresh" button
4. Check browser console for errors

### **Backend not responding?**
```bash
# Restart backend
cd backend
npm start
```

### **Frontend not loading?**
```bash
# Restart frontend
npm run dev
```

---

## 📱 Mobile Access

Yes! The admin dashboard works on:
- ✅ Desktop computers
- ✅ Tablets (iPad, Android tablets)
- ✅ Smartphones (iOS, Android)
- ✅ All modern browsers

---

## 🎓 Learn More

**Detailed Guide**: See [ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md)

**API Documentation**: See `backend/routes/adminRoutes.js`

**Components**: See `src/components/admin/EnhancedAdminDashboard.tsx`

---

## ✅ Quick Checklist

Before you start:
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Admin account created
- [ ] Login URL bookmarked
- [ ] Credentials saved securely

Daily tasks:
- [ ] Check pending orders
- [ ] Update order statuses
- [ ] Export daily reports
- [ ] Monitor customer activity
- [ ] Update menu availability

---

**Need Help?** Run: `node scripts/adminAccess.js` for access information.

**Last Updated:** February 5, 2026

# 📊 Admin Dashboard Guide

## 🔐 How to Access the Admin Dashboard

### Method 1: Using the Web Interface

1. **Navigate to Admin Login Page**
   - URL: `http://localhost:5173/admin/login`
   - Or for production: `https://yourdomain.com/admin/login`

2. **Login with Admin Credentials**
   - Email: `admin@nayomis.com` (or your configured admin email)
   - Password: Your admin password

3. **Access Dashboard**
   - After successful login, you'll be redirected to `/admin/dashboard`

---

### Method 2: Creating a New Admin Account

**Option A: Using the Create Admin Script**

```bash
cd backend
node scripts/createAdmin.js
```

**Option B: Using MongoDB Directly**

```bash
# Connect to your MongoDB
mongosh

# Use your database
use nayomis_waterfront

# Create admin user
db.admins.insertOne({
  username: "admin",
  email: "admin@nayomis.com",
  password: "your_secure_password",
  role: "admin",
  createdAt: new Date()
})
```

**Option C: Using the Reset Admin Password Script**

```bash
cd backend
node scripts/resetAdminPassword.js
```

---

## 🎯 Dashboard Features & Capabilities

### 1. **Real-Time Statistics Dashboard**

The main dashboard provides instant insights into:

- **Total Revenue**: Complete earnings with trend indicators
- **Total Orders**: All-time order count with today's orders
- **Active Customers**: Registered user base
- **Pending Orders**: Orders requiring immediate attention

**Auto-Refresh**: Data refreshes automatically every 30 seconds

---

### 2. **Order Management System**

#### **Quick Actions**
- ✅ View all orders in real-time
- ✅ Filter by status (Pending, Preparing, Ready, Delivered)
- ✅ Search by Order ID or Customer Name
- ✅ Filter by date range (Today, Week, Month, All)
- ✅ Quick status updates with one click
- ✅ Export orders to CSV

#### **Order Status Workflow**
```
Pending → Preparing → Ready → Delivered
```

**How to Update Order Status:**

1. **For Pending Orders:**
   - Click "Start Preparing" button
   - Order moves to "Preparing" status
   - Customer receives notification

2. **For Preparing Orders:**
   - Click "Mark Ready" button
   - Order moves to "Ready" status
   - Customer can pickup

3. **For Ready Orders:**
   - Click "Mark Delivered" button
   - Order completes
   - Transaction closes

#### **Sending Data to Customers**

**Automatic Notifications:**
- ✅ Order Confirmation (when order is placed)
- ✅ Order Preparing (when status changes to preparing)
- ✅ Order Ready (when status changes to ready)
- ✅ Order Delivered (when order is completed)

**Manual Communication:**
- View customer email in order details
- Contact customer directly via displayed contact info

---

### 3. **Customer Management**

**View Customer Data:**
- Customer name, email, phone
- Loyalty points earned
- Total orders placed
- Registration date

**Retrieve Customer Information:**
- Use search bar to find specific customers
- Sort by loyalty points to identify top customers
- View complete order history per customer

**Send Data to Customers:**
- Export customer list to CSV
- View contact information for direct communication
- Track customer engagement via order history

---

### 4. **Menu Management**

**Capabilities:**
- ✅ View all menu items
- ✅ Add new food items
- ✅ Edit existing items
- ✅ Toggle availability (in-stock/out-of-stock)
- ✅ Delete menu items
- ✅ Organize by category

**Adding New Menu Item:**
1. Click "Add Menu Item" button
2. Fill in details:
   - Name
   - Category
   - Price
   - Description
   - Availability status
3. Click "Add Item"
4. Changes reflect immediately on customer menu

---

## 📤 How to Send Data to Customers

### **1. Order Status Updates**
Customers receive automatic updates when you change order status.

### **2. Export Customer Data**
```
Dashboard → Customers Tab → Export Button
```
- Generates CSV file with all customer data
- Includes: Name, Email, Phone, Orders, Points

### **3. Export Order Data**
```
Dashboard → Orders Tab → Export Orders Button
```
- Generates CSV file with filtered orders
- Includes: Order ID, Customer, Items, Total, Status, Date
- Respects current filters (status, date range, search)

### **4. Direct Communication**
- Click on any order to view customer contact details
- Use email/phone information for direct communication

---

## 📊 How to Retrieve Customer Orders

### **Method 1: Dashboard View**
1. Navigate to "Orders" tab
2. Use filters:
   - **Search**: Enter customer name or order ID
   - **Status Filter**: Select order status
   - **Date Filter**: Choose time range
3. View complete order details

### **Method 2: Customer View**
1. Navigate to "Customers" tab
2. Search for specific customer
3. View their order count
4. Click to see detailed order history

### **Method 3: Export Data**
1. Apply desired filters
2. Click "Export Orders"
3. Open CSV file in Excel/Google Sheets
4. Analyze data as needed

---

## 🔄 Real-Time Data Synchronization

### **Auto-Refresh Intervals**
- **Stats**: Every 30 seconds
- **Orders**: Every 10 seconds
- **Customers**: Every 15 seconds
- **Menu**: Manual refresh or on update

### **Manual Refresh**
Click the "Refresh" button in the top-right to instantly update all data.

---

## 📈 Understanding Dashboard Metrics

### **Revenue Tracking**
- Shows total revenue from all completed orders
- Displays growth percentage from previous month
- Helps track business performance

### **Order Metrics**
- **Total Orders**: Lifetime order count
- **Today's Orders**: Current day activity
- **Pending Orders**: Requires immediate action
- **Status Distribution**: Visual breakdown of order states

### **Customer Analytics**
- **Active Customers**: Total registered users
- **Top Customers**: Sorted by loyalty points
- **Customer Growth**: New registrations over time

---

## 🎨 Dashboard Structure & Navigation

### **Header Section**
- Admin email display
- Refresh button
- Logout button

### **Statistics Cards (Top)**
- 4 Key metrics with visual indicators
- Real-time updates
- Trend arrows

### **Quick Status Cards (Middle)**
- Preparing orders count
- Ready orders count
- Menu items count

### **Main Content Tabs**
1. **Overview**: Recent activity & top customers
2. **Orders**: Complete order management
3. **Customers**: Customer database
4. **Menu**: Menu item management

---

## 🛠️ Best Practices

### **Order Management**
1. Check "Pending Orders" regularly (at least every 15 minutes)
2. Update order status promptly to keep customers informed
3. Use quick action buttons for faster processing
4. Export daily reports for record keeping

### **Customer Relations**
1. Monitor top customers and reward loyalty
2. Track customer complaints via order notes
3. Maintain updated contact information
4. Review customer order patterns

### **Menu Management**
1. Mark items as unavailable when out of stock
2. Update prices during quiet hours
3. Add new items with complete descriptions
4. Remove discontinued items promptly

### **Data Management**
1. Export weekly reports for analysis
2. Back up customer data regularly
3. Review revenue trends monthly
4. Monitor order patterns for inventory planning

---

## 🚀 Quick Start Workflow

### **Daily Admin Tasks**

**Morning Routine:**
1. Login to admin dashboard
2. Review overnight orders
3. Check pending orders
4. Update menu availability
5. Review today's statistics

**During Service:**
1. Monitor new orders (auto-refresh)
2. Update order status as kitchen progresses
3. Respond to customer inquiries
4. Manage menu item availability

**End of Day:**
1. Complete all remaining orders
2. Export daily order report
3. Review revenue statistics
4. Note any issues for tomorrow

---

## 📞 Support & Troubleshooting

### **Common Issues**

**Can't Login?**
- Verify admin credentials
- Run `node scripts/verifyAdmin.js` to check admin account
- Reset password using `node scripts/resetAdminPassword.js`

**Data Not Loading?**
- Click refresh button
- Check internet connection
- Verify backend server is running
- Check browser console for errors

**Orders Not Updating?**
- Check auto-refresh is working
- Manually click refresh
- Verify database connection
- Check order status workflow

---

## 🔒 Security Best Practices

1. **Never share admin credentials**
2. **Use strong passwords** (minimum 12 characters)
3. **Logout when leaving computer**
4. **Change password regularly** (every 90 days)
5. **Monitor access logs**
6. **Use HTTPS in production**
7. **Restrict admin access to trusted IPs**

---

## 📱 Mobile Access

The admin dashboard is fully responsive:
- Access from tablets
- Use on mobile phones
- Touch-friendly interface
- Optimized for all screen sizes

---

## 🎯 Success Metrics

**Track These KPIs:**
- Average order processing time
- Customer retention rate
- Daily revenue trends
- Popular menu items
- Peak ordering hours
- Customer satisfaction (via reviews)

---

## 📝 Additional Resources

- **API Documentation**: See `/backend/routes/adminRoutes.js`
- **Database Schema**: See `/backend/models/`
- **Frontend Components**: See `/src/components/admin/`
- **Scripts**: See `/backend/scripts/`

---

## 🎉 Getting Started Checklist

- [ ] Create admin account
- [ ] Login to dashboard
- [ ] Review statistics
- [ ] Check pending orders
- [ ] Explore all tabs
- [ ] Test order status updates
- [ ] Export sample data
- [ ] Set up daily routine
- [ ] Bookmark admin login page
- [ ] Save admin credentials securely

---

**Need Help?** Contact technical support or refer to the main README.md file.

**Last Updated:** February 5, 2026

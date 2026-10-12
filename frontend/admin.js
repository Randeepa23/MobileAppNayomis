const API_URL = 'http://localhost:5000/api';

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    loadDashboard();
    
    // Auto-refresh every 30 seconds for active section
    setInterval(() => {
        const activeSection = document.querySelector('.admin-section.active');
        if (activeSection) {
            const sectionId = activeSection.id;
            switch(sectionId) {
                case 'dashboard': loadDashboard(); break;
                case 'students': loadStudents(); break;
                case 'orders': loadOrders(); break;
                case 'food': loadFoodItems(); break;
                case 'reviews': loadReviews(); break;
                case 'loyalty': loadLoyalty(); break;
            }
        }
    }, 30000);
});

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Load data for the section
    switch(sectionName) {
        case 'dashboard': loadDashboard(); break;
        case 'students': loadStudents(); break;
        case 'orders': loadOrders(); break;
        case 'food': loadFoodItems(); break;
        case 'reviews': loadReviews(); break;
        case 'loyalty': loadLoyalty(); break;
    }
}

async function loadDashboard() {
    try {
        showLoading('dashboard');
        
        // Load dashboard stats
        const dashboardResponse = await fetch(`${API_URL}/admin/dashboard`);
        if (!dashboardResponse.ok) {
            throw new Error(`Dashboard API error: ${dashboardResponse.status}`);
        }
        const dashboardData = await dashboardResponse.json();
        
        // Update stats
        document.getElementById('totalStudents').textContent = dashboardData.totalStudents || 0;
        document.getElementById('totalOrders').textContent = dashboardData.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = `Rs.${dashboardData.totalRevenue || 0}`;
        document.getElementById('totalReviews').textContent = dashboardData.totalReviews || 0;
        
        // Load recent activities (recent orders)
        const ordersResponse = await fetch(`${API_URL}/admin/orders?limit=5`);
        if (!ordersResponse.ok) {
            throw new Error(`Orders API error: ${ordersResponse.status}`);
        }
        const recentOrders = await ordersResponse.json();
        
        const activitiesHTML = recentOrders.slice(0, 5).map(order => `
            <div class="activity-item">
                <span class="activity-icon">📋</span>
                <div class="activity-content">
                    <p><strong>${order.student?.name || 'Unknown'}</strong> placed an order</p>
                    <small>Rs.${order.total} • ${formatDate(order.createdAt)}</small>
                </div>
            </div>
        `).join('');
        
        document.getElementById('recentActivities').innerHTML = activitiesHTML || '<p>No recent activities</p>';
        
        hideLoading('dashboard');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showMessage('Error loading dashboard data: ' + error.message, 'error');
        hideLoading('dashboard');
    }
}

async function loadStudents() {
    try {
        showLoading('students');
        
        const response = await fetch(`${API_URL}/admin/students`);
        if (!response.ok) {
            throw new Error(`Students API error: ${response.status}`);
        }
        const students = await response.json();
        
        if (!Array.isArray(students)) {
            throw new Error('Invalid students data format');
        }
        
        const studentsHTML = students.map(student => `
            <tr>
                <td>${student.name || 'N/A'}</td>
                <td>${student.email || 'N/A'}</td>
                <td>${student.school || 'N/A'}</td>
                <td>${student.grade || 'N/A'}</td>
                <td>${student.whatsapp || 'N/A'}</td>
                <td><span class="loyalty-points">${student.loyaltyPoints || 0}</span></td>
                <td>${formatDate(student.createdAt)}</td>
            </tr>
        `).join('');
        
        document.getElementById('studentsTableBody').innerHTML = studentsHTML || '<tr><td colspan="7">No students found</td></tr>';
        hideLoading('students');
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('Error loading students: ' + error.message, 'error');
        document.getElementById('studentsTableBody').innerHTML = '<tr><td colspan="7" class="error">Failed to load students</td></tr>';
        hideLoading('students');
    }
}

async function loadOrders() {
    try {
        showLoading('orders');
        
        const response = await fetch(`${API_URL}/admin/orders`);
        if (!response.ok) {
            throw new Error(`Orders API error: ${response.status}`);
        }
        const orders = await response.json();
        
        if (!Array.isArray(orders)) {
            throw new Error('Invalid orders data format');
        }
        
        const ordersHTML = orders.map(order => `
            <tr>
                <td>#${order._id ? order._id.slice(-6) : 'N/A'}</td>
                <td>${order.student?.name || 'Unknown'}</td>
                <td>${order.items?.map(item => `${item.foodItem?.name || item.name || 'Unknown'} (x${item.quantity || 1})`).join(', ') || 'N/A'}</td>
                <td>Rs.${order.total || 0}</td>
                <td><span class="status-badge status-${order.status}">${order.status || 'pending'}</span></td>
                <td>${order.pickupLocation || 'N/A'}</td>
                <td>${order.pickupTime || 'N/A'}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-primary" onclick="updateOrderStatus('${order._id}', 'confirmed')">Confirm</button>
                        <button class="btn-sm btn-success" onclick="updateOrderStatus('${order._id}', 'completed')">Complete</button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('ordersTableBody').innerHTML = ordersHTML || '<tr><td colspan="9">No orders found</td></tr>';
        hideLoading('orders');
    } catch (error) {
        console.error('Error loading orders:', error);
        showMessage('Error loading orders: ' + error.message, 'error');
        document.getElementById('ordersTableBody').innerHTML = '<tr><td colspan="9" class="error">Failed to load orders</td></tr>';
        hideLoading('orders');
    }
}

async function loadFoodItems() {
    try {
        showLoading('food');
        
        const response = await fetch(`${API_URL}/food`);
        if (!response.ok) {
            throw new Error(`Food API error: ${response.status}`);
        }
        const foodItems = await response.json();
        
        if (!Array.isArray(foodItems)) {
            throw new Error('Invalid food items data format');
        }
        
        const foodHTML = foodItems.map(item => `
            <tr>
                <td>${item.name || 'N/A'}</td>
                <td>Rs.${item.price || 0}</td>
                <td>${item.category || 'N/A'}</td>
                <td>${getAvailableDaysText(item.availableDays)}</td>
                <td><span class="status-badge ${item.isAvailable !== false ? 'status-available' : 'status-unavailable'}">${item.isAvailable !== false ? 'Available' : 'Unavailable'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-info" onclick="editFood('${item._id}')">Edit</button>
                        <button class="btn-sm ${item.isAvailable !== false ? 'btn-warning' : 'btn-success'}" onclick="toggleFoodStatus('${item._id}', ${item.isAvailable === false})">
                            ${item.isAvailable !== false ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('foodTableBody').innerHTML = foodHTML || '<tr><td colspan="6">No food items found</td></tr>';
        hideLoading('food');
    } catch (error) {
        console.error('Error loading food items:', error);
        showMessage('Error loading food items: ' + error.message, 'error');
        document.getElementById('foodTableBody').innerHTML = '<tr><td colspan="6" class="error">Failed to load food items</td></tr>';
        hideLoading('food');
    }
}

async function loadReviews() {
    try {
        showLoading('reviews');
        
        const response = await fetch(`${API_URL}/admin/reviews`);
        if (!response.ok) {
            throw new Error(`Reviews API error: ${response.status}`);
        }
        const reviews = await response.json();
        
        if (!Array.isArray(reviews)) {
            throw new Error('Invalid reviews data format');
        }
        
        const reviewsHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-student">
                        <strong>${review.student?.name || 'Anonymous'}</strong>
                        <small>${review.student?.email || ''}</small>
                    </div>
                    <div class="review-rating">
                        ${'⭐'.repeat(review.rating || 0)}${'☆'.repeat(5 - (review.rating || 0))}
                        <span>(${review.rating || 0}/5)</span>
                    </div>
                </div>
                <div class="review-food">
                    <strong>Food:</strong> ${review.foodItem?.name || 'Unknown'}
                </div>
                <div class="review-comment">
                    ${review.comment || 'No comment provided'}
                </div>
                <div class="review-date">
                    ${formatDate(review.createdAt)}
                </div>
            </div>
        `).join('');
        
        document.getElementById('reviewsGrid').innerHTML = reviewsHTML || '<p>No reviews found</p>';
        hideLoading('reviews');
    } catch (error) {
        console.error('Error loading reviews:', error);
        showMessage('Error loading reviews: ' + error.message, 'error');
        document.getElementById('reviewsGrid').innerHTML = '<p class="error">Failed to load reviews</p>';
        hideLoading('reviews');
    }
}

async function loadLoyalty() {
    try {
        showLoading('loyalty');
        
        const response = await fetch(`${API_URL}/admin/loyalty`);
        const loyaltyData = await response.json();
        
        // Update summary stats
        const totalPoints = loyaltyData.students.reduce((sum, student) => sum + (student.loyaltyPoints || 0), 0);
        const avgPoints = loyaltyData.students.length ? Math.round(totalPoints / loyaltyData.students.length) : 0;
        const topStudent = loyaltyData.students.sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))[0];
        
        document.getElementById('totalPointsIssued').textContent = totalPoints;
        document.getElementById('avgPointsPerStudent').textContent = avgPoints;
        document.getElementById('topLoyaltyStudent').textContent = topStudent ? topStudent.name : 'N/A';
        
        // Load detailed loyalty table
        const loyaltyHTML = loyaltyData.students.map(student => {
            const totalSpent = student.totalSpent || 0;
            const orderCount = student.orderCount || 0;
            const avgOrderValue = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;
            
            return `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td><span class="loyalty-points">${student.loyaltyPoints || 0}</span></td>
                    <td>${orderCount}</td>
                    <td>Rs.${totalSpent}</td>
                    <td>Rs.${avgOrderValue}</td>
                </tr>
            `;
        }).join('');
        
        document.getElementById('loyaltyTableBody').innerHTML = loyaltyHTML || '<tr><td colspan="6">No loyalty data found</td></tr>';
        hideLoading('loyalty');
    } catch (error) {
        console.error('Error loading loyalty data:', error);
        showMessage('Error loading loyalty data', 'error');
        hideLoading('loyalty');
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
        return 'Invalid date';
    }
}

function getAvailableDaysText(availableDays) {
    if (!availableDays || typeof availableDays !== 'object') {
        return 'All days';
    }
    
    const days = [];
    const dayNames = {
        monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
        thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    
    Object.keys(dayNames).forEach(day => {
        if (availableDays[day]) {
            days.push(dayNames[day]);
        }
    });
    
    return days.length ? days.join(', ') : 'No days';
}

function showLoading(section) {
    const loadingElements = document.querySelectorAll(`#${section} .loading`);
    loadingElements.forEach(el => {
        if (el) el.style.display = 'block';
    });
}

function hideLoading(section) {
    const loadingElements = document.querySelectorAll(`#${section} .loading`);
    loadingElements.forEach(el => {
        if (el) el.style.display = 'none';
    });
}

function showMessage(text, type = 'info') {
    const toast = document.getElementById('messageToast');
    const messageText = document.getElementById('messageText');
    
    if (toast && messageText) {
        messageText.textContent = text;
        toast.className = `message-toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    }
}

function hideMessage() {
    const toast = document.getElementById('messageToast');
    if (toast) {
        toast.classList.add('hidden');
    }
}

// Refresh functions
function refreshStudents() {
    loadStudents();
}

function refreshFood() {
    loadFoodItems();
}

function refreshOrders() {
    loadOrders();
}

function refreshReviews() {
    loadReviews();
}

function refreshLoyalty() {
    loadLoyalty();
}

// Order management functions
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showMessage(`Order ${newStatus} successfully`, 'success');
            loadOrders(); // Refresh the orders list
        } else {
            throw new Error('Failed to update order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showMessage('Error updating order status', 'error');
    }
}

// Food management functions
function showAddFoodForm() {
    document.getElementById('addFoodForm').classList.remove('hidden');
}

function hideAddFoodForm() {
    document.getElementById('addFoodForm').classList.add('hidden');
    document.getElementById('foodForm').reset();
}

async function toggleFoodStatus(foodId, isAvailable) {
    try {
        const response = await fetch(`${API_URL}/food/${foodId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isAvailable })
        });
        
        if (response.ok) {
            showMessage(`Food item ${isAvailable ? 'enabled' : 'disabled'} successfully`, 'success');
            loadFoodItems(); // Refresh the food items list
        } else {
            throw new Error('Failed to update food status');
        }
    } catch (error) {
        console.error('Error updating food status:', error);
        showMessage('Error updating food status', 'error');
    }
}

function editFood(foodId) {
    // Placeholder for edit functionality
    showMessage('Edit functionality not implemented yet', 'info');
}

// Food form submission
document.addEventListener('DOMContentLoaded', function() {
    const foodForm = document.getElementById('foodForm');
    if (foodForm) {
        foodForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const days = {};
            
            // Get selected days
            document.querySelectorAll('input[name="days"]:checked').forEach(input => {
                days[input.value] = true;
            });
            
            const foodData = {
                name: document.getElementById('foodName').value,
                price: parseFloat(document.getElementById('foodPrice').value),
                description: document.getElementById('foodDescription').value,
                category: document.getElementById('foodCategory').value,
                availableDays: days
            };
            
            try {
                const response = await fetch(`${API_URL}/food`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(foodData)
                });
                
                if (response.ok) {
                    showMessage('Food item added successfully', 'success');
                    hideAddFoodForm();
                    loadFoodItems(); // Refresh the food items list
                } else {
                    throw new Error('Failed to add food item');
                }
            } catch (error) {
                console.error('Error adding food item:', error);
                showMessage('Error adding food item', 'error');
            }
        });
    }
});
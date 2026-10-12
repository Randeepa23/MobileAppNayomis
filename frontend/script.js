const API_BASE = 'http://localhost:5000/api';

class StudentFoodApp {
    constructor() {
        this.student = null;
        this.foodItems = [];
        this.cart = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.setCurrentDay();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Auth tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Menu
        document.getElementById('daySelect').addEventListener('change', () => this.loadFoodItems());
        document.getElementById('placeOrderBtn').addEventListener('click', () => this.placeOrder());
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
        document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
    }

    setCurrentDay() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()];
        document.getElementById('daySelect').value = today;
    }

    checkAuthStatus() {
        const savedStudent = localStorage.getItem('student');
        if (savedStudent) {
            this.student = JSON.parse(savedStudent);
            this.showMenu();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_BASE}/students/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data); // Debug log
            if (response.ok) {
                this.student = data.student;
                console.log('Student data after login:', this.student); // Debug log
                localStorage.setItem('student', JSON.stringify(this.student));
                this.showMessage('Login successful!', 'success');
                this.showMenu();
                
                // Refresh user data to ensure we have the latest loyalty points
                await this.refreshUserData();
            } else {
                this.showMessage(data.message, 'error');
            }
        } catch (error) {
            this.showMessage('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            school: document.getElementById('regSchool').value,
            grade: document.getElementById('regGrade').value,
            address: document.getElementById('regAddress').value,
            whatsapp: document.getElementById('regWhatsapp').value
        };

        try {
            const response = await fetch(`${API_BASE}/students/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                this.showMessage('Registration successful! Please login.', 'success');
                this.switchTab('login');
                document.getElementById('registerForm').reset();
            } else {
                this.showMessage(data.message, 'error');
            }
        } catch (error) {
            this.showMessage('Registration failed. Please try again.', 'error');
        }
    }

    logout() {
        this.student = null;
        this.cart.clear();
        localStorage.removeItem('student');
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('menuSection').classList.add('hidden');
        document.getElementById('userInfo').classList.add('hidden');
        this.updateCartDisplay();
    }

    showMenu() {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('menuSection').classList.remove('hidden');
        document.getElementById('userInfo').classList.remove('hidden');
        
        this.updateUserDisplay();
        this.loadFoodItems();
    }

    updateUserDisplay() {
        console.log('Updating user display with student:', this.student); // Debug log
        document.getElementById('userName').textContent = this.student.name;
        document.getElementById('loyaltyPoints').textContent = `${this.student.loyaltyPoints || 0} pts`;
        console.log('Loyalty points display set to:', `${this.student.loyaltyPoints || 0} pts`); // Debug log
    }

    async refreshUserData() {
        try {
            console.log('Refreshing user data for student ID:', this.student.id); // Debug log
            const response = await fetch(`${API_BASE}/students/${this.student.id}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Refreshed user data response:', data); // Debug log
                this.student = data.student;
                localStorage.setItem('student', JSON.stringify(this.student));
                this.updateUserDisplay();
            } else {
                console.error('Failed to refresh user data:', response.status); // Debug log
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    }

    async loadFoodItems() {
        try {
            const day = document.getElementById('daySelect').value;
            const response = await fetch(`${API_BASE}/food?day=${day}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle both array response and object with foodItems property
            this.foodItems = Array.isArray(data) ? data : (data.foodItems || []);
            this.renderFoodItems();
        } catch (error) {
            console.error('Error loading food items:', error);
            this.showMessage('Failed to load menu items', 'error');
        }
    }

    renderFoodItems() {
        const grid = document.getElementById('foodGrid');
        grid.innerHTML = '';

        if (!this.foodItems || this.foodItems.length === 0) {
            grid.innerHTML = '<p class="no-items">No items available for this day</p>';
            return;
        }

        this.foodItems.forEach(item => {
            const card = document.createElement('div');
            card.className = `food-card ${item.disabled ? 'disabled' : ''}`;
            
            card.innerHTML = `
                <h3>${item.name}</h3>
                <div class="food-price">Rs.${item.price}</div>
                <div class="food-description">${item.description || ''}</div>
                <div class="food-category">${item.category || ''}</div>
                ${item.disabled ? 
                    `<div class="disabled-message">${item.message}</div>` : 
                    `<div class="quantity-controls">
                        <button class="qty-btn" onclick="app.updateQuantity('${item._id}', -1)">-</button>
                        <span class="quantity">${this.cart.get(item._id) || 0}</span>
                        <button class="qty-btn" onclick="app.updateQuantity('${item._id}', 1)">+</button>
                    </div>`
                }
            `;
            
            grid.appendChild(card);
        });
    }

    updateQuantity(itemId, change) {
        const current = this.cart.get(itemId) || 0;
        const newQty = Math.max(0, current + change);
        
        if (newQty === 0) {
            this.cart.delete(itemId);
        } else {
            this.cart.set(itemId, newQty);
        }
        
        this.renderFoodItems();
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartDiv = document.getElementById('cart');
        const totalSpan = document.getElementById('orderTotal');
        const orderBtn = document.getElementById('placeOrderBtn');
        
        if (this.cart.size === 0) {
            cartDiv.innerHTML = '<p>No items in cart</p>';
            totalSpan.textContent = '0';
            orderBtn.disabled = true;
            return;
        }

        let total = 0;
        let cartHtml = '';
        
        this.cart.forEach((qty, itemId) => {
            const item = this.foodItems.find(f => f._id === itemId);
            if (item) {
                const subtotal = item.price * qty;
                total += subtotal;
                
                cartHtml += `
                    <div class="cart-item">
                        <span>${item.name} x${qty}</span>
                        <span>Rs.${subtotal}</span>
                    </div>
                `;
            }
        });
        
        cartDiv.innerHTML = cartHtml;
        totalSpan.textContent = total;
        orderBtn.disabled = false;
    }

    async placeOrder() {
        const pickupLocation = document.getElementById('pickupLocation').value;
        const pickupTime = document.getElementById('pickupTime').value;
        
        if (!pickupLocation || !pickupTime) {
            this.showMessage('Please select pickup location and time', 'error');
            return;
        }

        // Format pickup time as full datetime for backend
        const today = new Date();
        const [hours, minutes] = pickupTime.split(':');
        const pickupDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

        const items = Array.from(this.cart.entries()).map(([foodItem, quantity]) => ({
            foodItem,
            quantity
        }));

        try {
            const response = await fetch(`${API_BASE}/orders/place`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: this.student.id,
                    items,
                    pickupLocation,
                    pickupTime: pickupDateTime.toISOString()
                })
            });

            const data = await response.json();
            if (response.ok) {
                this.showMessage(`Order placed! You'll earn ${data.loyaltyPointsEarned} loyalty points.`, 'success');
                this.cart.clear();
                this.updateCartDisplay();
                this.renderFoodItems();
                
                // Refresh user data to update loyalty points
                await this.refreshUserData();
                
                // Clear pickup details
                document.getElementById('pickupLocation').value = '';
                document.getElementById('pickupTime').value = '';
            } else {
                this.showMessage(data.message, 'error');
            }
        } catch (error) {
            this.showMessage('Failed to place order. Please try again.', 'error');
        }
    }

    showMessage(text, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');
        
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 3000);
    }
}

const app = new StudentFoodApp();
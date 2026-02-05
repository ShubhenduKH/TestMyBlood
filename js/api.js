// ========================================
// Test My Blood - API Client
// ========================================

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001/api'
    : `${window.location.origin}/api`;

// ========================================
// API Helper Functions
// ========================================

// Get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Set auth token
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove auth token
function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ========================================
// Auth API
// ========================================

const AuthAPI = {
    async register(userData) {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: userData
        });
        if (response.success) {
            setToken(response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
        return response;
    },

    async login(email, password, user_type = null) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: { email, password, user_type }
        });
        if (response.success) {
            setToken(response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
        return response;
    },

    async getProfile() {
        return await apiRequest('/auth/profile');
    },

    async updateProfile(data) {
        return await apiRequest('/auth/profile', {
            method: 'PUT',
            body: data
        });
    },

    async changePassword(currentPassword, newPassword) {
        return await apiRequest('/auth/change-password', {
            method: 'PUT',
            body: { currentPassword, newPassword }
        });
    },

    logout() {
        removeToken();
        window.location.href = getBasePath() + 'index.html';
    },

    isLoggedIn() {
        return !!getToken() && !!localStorage.getItem('currentUser');
    },

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
};

// ========================================
// Tests API
// ========================================

const TestsAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/tests${queryString ? '?' + queryString : ''}`);
    },

    async getById(id) {
        return await apiRequest(`/tests/${id}`);
    },

    async getCategories() {
        return await apiRequest('/tests/categories');
    },

    async create(testData) {
        return await apiRequest('/tests', {
            method: 'POST',
            body: testData
        });
    },

    async update(id, testData) {
        return await apiRequest(`/tests/${id}`, {
            method: 'PUT',
            body: testData
        });
    },

    async delete(id) {
        return await apiRequest(`/tests/${id}`, {
            method: 'DELETE'
        });
    }
};

// ========================================
// Labs API
// ========================================

const LabsAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/labs${queryString ? '?' + queryString : ''}`);
    },

    async getById(id) {
        return await apiRequest(`/labs/${id}`);
    },

    async create(labData) {
        return await apiRequest('/labs', {
            method: 'POST',
            body: labData
        });
    },

    async update(id, labData) {
        return await apiRequest(`/labs/${id}`, {
            method: 'PUT',
            body: labData
        });
    },

    async delete(id) {
        return await apiRequest(`/labs/${id}`, {
            method: 'DELETE'
        });
    }
};

// ========================================
// Doctors API
// ========================================

const DoctorsAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/doctors${queryString ? '?' + queryString : ''}`);
    },

    async getById(id) {
        return await apiRequest(`/doctors/${id}`);
    },

    async getSpecialties() {
        return await apiRequest('/doctors/specialties');
    },

    async create(doctorData) {
        return await apiRequest('/doctors', {
            method: 'POST',
            body: doctorData
        });
    },

    async update(id, doctorData) {
        return await apiRequest(`/doctors/${id}`, {
            method: 'PUT',
            body: doctorData
        });
    },

    async delete(id) {
        return await apiRequest(`/doctors/${id}`, {
            method: 'DELETE'
        });
    },

    async bookAppointment(appointmentData) {
        return await apiRequest('/doctors/appointments', {
            method: 'POST',
            body: appointmentData
        });
    },

    async getMyAppointments() {
        return await apiRequest('/doctors/appointments/my');
    }
};

// ========================================
// Bookings API
// ========================================

const BookingsAPI = {
    async create(bookingData) {
        return await apiRequest('/bookings', {
            method: 'POST',
            body: bookingData
        });
    },

    async getMyBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/bookings/my${queryString ? '?' + queryString : ''}`);
    },

    async getById(bookingId) {
        return await apiRequest(`/bookings/${bookingId}`);
    },

    async cancel(bookingId) {
        return await apiRequest(`/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });
    },

    // Admin methods
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/bookings${queryString ? '?' + queryString : ''}`);
    },

    async updateStatus(bookingId, status, collectorId = null) {
        return await apiRequest(`/bookings/${bookingId}/status`, {
            method: 'PUT',
            body: { status, collector_id: collectorId }
        });
    },

    async assignCollector(bookingId, collectorId) {
        return await apiRequest(`/bookings/${bookingId}/assign`, {
            method: 'PUT',
            body: { collector_id: collectorId }
        });
    },

    async uploadReport(bookingId, reportUrl, notes = '') {
        return await apiRequest(`/bookings/${bookingId}/report`, {
            method: 'PUT',
            body: { report_url: reportUrl, report_notes: notes }
        });
    },

    // Collector methods
    async getAssignedCollections(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/bookings/collector/assigned${queryString ? '?' + queryString : ''}`);
    },

    async markCollected(bookingId) {
        return await apiRequest(`/bookings/${bookingId}/collect`, {
            method: 'PUT'
        });
    }
};

// ========================================
// Admin API
// ========================================

const AdminAPI = {
    async getDashboard() {
        return await apiRequest('/admin/dashboard');
    },

    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/admin/users${queryString ? '?' + queryString : ''}`);
    },

    async getCollectors() {
        return await apiRequest('/admin/collectors');
    },

    async createCollector(collectorData) {
        return await apiRequest('/admin/collectors', {
            method: 'POST',
            body: collectorData
        });
    },

    async updateUserStatus(userId, isActive) {
        return await apiRequest(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: { is_active: isActive }
        });
    },

    async deleteUser(userId) {
        return await apiRequest(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    },

    async getMessages() {
        return await apiRequest('/admin/messages');
    }
};

// ========================================
// Contact API
// ========================================

const ContactAPI = {
    async submit(contactData) {
        return await apiRequest('/contact', {
            method: 'POST',
            body: contactData
        });
    }
};

// ========================================
// Payments API (Razorpay Integration)
// ========================================

const PaymentsAPI = {
    // Create Razorpay order
    async createOrder(bookingId, amount) {
        return await apiRequest('/payments/create-order', {
            method: 'POST',
            body: { booking_id: bookingId, amount }
        });
    },

    // Verify payment after Razorpay checkout
    async verifyPayment(paymentData) {
        return await apiRequest('/payments/verify', {
            method: 'POST',
            body: paymentData
        });
    },

    // Get payment status for a booking
    async getStatus(bookingId) {
        return await apiRequest(`/payments/status/${bookingId}`);
    },

    // Initiate refund (Admin only)
    async initiateRefund(bookingId, reason) {
        return await apiRequest('/payments/refund', {
            method: 'POST',
            body: { booking_id: bookingId, reason }
        });
    }
};

// ========================================
// Razorpay Checkout Helper
// ========================================

async function initiatePayment(bookingId, amount, userDetails, onSuccess, onError) {
    try {
        // Create order on backend
        const orderResponse = await PaymentsAPI.createOrder(bookingId, amount);

        if (!orderResponse.success) {
            throw new Error(orderResponse.message || 'Failed to create order');
        }

        const { order_id, key } = orderResponse.data;

        // Configure Razorpay options
        const options = {
            key: key,
            amount: orderResponse.data.amount,
            currency: orderResponse.data.currency || 'INR',
            name: 'LAB CARE',
            description: `Blood Test Booking - ${bookingId}`,
            order_id: order_id,
            prefill: {
                name: userDetails.name || '',
                email: userDetails.email || '',
                contact: userDetails.phone || ''
            },
            notes: {
                booking_id: bookingId
            },
            theme: {
                color: '#e74c3c'
            },
            handler: async function(response) {
                try {
                    // Verify payment on backend
                    const verifyResponse = await PaymentsAPI.verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        booking_id: bookingId
                    });

                    if (verifyResponse.success) {
                        if (onSuccess) onSuccess(verifyResponse);
                    } else {
                        throw new Error(verifyResponse.message || 'Payment verification failed');
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    if (onError) onError(error);
                }
            },
            modal: {
                ondismiss: function() {
                    console.log('Payment cancelled by user');
                    if (onError) onError(new Error('Payment cancelled'));
                }
            }
        };

        // Open Razorpay checkout
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
            console.error('Payment failed:', response.error);
            if (onError) onError(new Error(response.error.description || 'Payment failed'));
        });
        rzp.open();

    } catch (error) {
        console.error('Payment initiation error:', error);
        if (onError) onError(error);
    }
}

// ========================================
// Utility Functions
// ========================================

function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        return '../../';
    }
    return '';
}

function formatPrice(price) {
    return '₹' + parseFloat(price).toLocaleString('en-IN');
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill"></i>';
    }
    if (hasHalf) {
        stars += '<i class="bi bi-star-half"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star"></i>';
    }
    return stars;
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// ========================================
// Cart Functions (Client-side only)
// ========================================

function addToCart(test) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (!cart.find(item => item.id === test.id)) {
        cart.push(test);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast('Test added to cart!', 'success');
        return true;
    } else {
        showToast('Test already in cart', 'warning');
        return false;
    }
}

function removeFromCart(testId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== testId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Test removed from cart', 'info');
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + parseFloat(item.price), 0);
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cart = getCart();
    cartCountElements.forEach(el => {
        el.textContent = cart.length;
        el.style.display = cart.length > 0 ? 'inline-block' : 'none';
    });
}

// ========================================
// Export for global use
// ========================================

window.API = {
    Auth: AuthAPI,
    Tests: TestsAPI,
    Labs: LabsAPI,
    Doctors: DoctorsAPI,
    Bookings: BookingsAPI,
    Admin: AdminAPI,
    Contact: ContactAPI,
    Payments: PaymentsAPI
};

// Export payment helper
window.initiatePayment = initiatePayment;

window.Utils = {
    getBasePath,
    formatPrice,
    generateStars,
    showToast,
    addToCart,
    removeFromCart,
    getCart,
    getCartTotal,
    clearCart,
    updateCartCount
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

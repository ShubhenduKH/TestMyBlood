// ========================================
// Test My Blood - Main JavaScript
// ========================================

// ========================================
// Location Data
// ========================================
const locationsData = [
    { id: 1, city: 'Mumbai', state: 'Maharashtra', pincode: '400001', area: 'South Mumbai' },
    { id: 2, city: 'Mumbai', state: 'Maharashtra', pincode: '400050', area: 'Bandra' },
    { id: 3, city: 'Mumbai', state: 'Maharashtra', pincode: '400076', area: 'Powai' },
    { id: 4, city: 'Delhi', state: 'Delhi', pincode: '110001', area: 'Connaught Place' },
    { id: 5, city: 'Delhi', state: 'Delhi', pincode: '110017', area: 'Hauz Khas' },
    { id: 6, city: 'Delhi', state: 'Delhi', pincode: '110085', area: 'Rohini' },
    { id: 7, city: 'Bangalore', state: 'Karnataka', pincode: '560001', area: 'MG Road' },
    { id: 8, city: 'Bangalore', state: 'Karnataka', pincode: '560034', area: 'Koramangala' },
    { id: 9, city: 'Bangalore', state: 'Karnataka', pincode: '560103', area: 'Whitefield' },
    { id: 10, city: 'Hyderabad', state: 'Telangana', pincode: '500001', area: 'Abids' },
    { id: 11, city: 'Hyderabad', state: 'Telangana', pincode: '500081', area: 'Hitech City' },
    { id: 12, city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', area: 'George Town' },
    { id: 13, city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', area: 'T Nagar' },
    { id: 14, city: 'Pune', state: 'Maharashtra', pincode: '411001', area: 'Camp' },
    { id: 15, city: 'Pune', state: 'Maharashtra', pincode: '411057', area: 'Hinjewadi' },
    { id: 16, city: 'Kolkata', state: 'West Bengal', pincode: '700001', area: 'BBD Bagh' },
    { id: 17, city: 'Kolkata', state: 'West Bengal', pincode: '700091', area: 'Salt Lake' },
    { id: 18, city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', area: 'Relief Road' },
    { id: 19, city: 'Jaipur', state: 'Rajasthan', pincode: '302001', area: 'MI Road' },
    { id: 20, city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', area: 'Hazratganj' }
];

// Mock Data for Tests, Labs, Doctors
const testsData = [
    { id: 1, name: "Complete Blood Count (CBC)", price: 299, originalPrice: 399, category: "Basic", lab: "HealthCare Labs", description: "Measures red cells, white cells, hemoglobin, and platelets", fasting: false, reportTime: "24 hrs" },
    { id: 2, name: "Lipid Profile", price: 499, originalPrice: 699, category: "Heart", lab: "DiagnoPlus", description: "Complete cholesterol test including HDL, LDL, and triglycerides", fasting: true, reportTime: "24 hrs" },
    { id: 3, name: "Thyroid Profile (T3, T4, TSH)", price: 399, originalPrice: 599, category: "Thyroid", lab: "MedTest Center", description: "Complete thyroid function test", fasting: false, reportTime: "24 hrs" },
    { id: 4, name: "Diabetes Panel (HbA1c + FBS)", price: 599, originalPrice: 799, category: "Diabetes", lab: "HealthCare Labs", description: "Blood sugar monitoring with 3-month average", fasting: true, reportTime: "24 hrs" },
    { id: 5, name: "Liver Function Test (LFT)", price: 449, originalPrice: 649, category: "Liver", lab: "DiagnoPlus", description: "Complete liver health assessment", fasting: false, reportTime: "24 hrs" },
    { id: 6, name: "Kidney Function Test (KFT)", price: 449, originalPrice: 649, category: "Kidney", lab: "MedTest Center", description: "Comprehensive kidney function assessment", fasting: false, reportTime: "24 hrs" },
    { id: 7, name: "Full Body Checkup", price: 1499, originalPrice: 2199, category: "Package", lab: "HealthCare Labs", description: "70+ parameters comprehensive health check", fasting: true, reportTime: "48 hrs" },
    { id: 8, name: "Vitamin D Test", price: 599, originalPrice: 899, category: "Vitamin", lab: "DiagnoPlus", description: "25-Hydroxy Vitamin D level test", fasting: false, reportTime: "24 hrs" },
    { id: 9, name: "Vitamin B12 Test", price: 499, originalPrice: 699, category: "Vitamin", lab: "MedTest Center", description: "Serum Vitamin B12 level test", fasting: false, reportTime: "24 hrs" },
    { id: 10, name: "Iron Studies", price: 599, originalPrice: 799, category: "Basic", lab: "HealthCare Labs", description: "Serum Iron, TIBC, Ferritin", fasting: true, reportTime: "24 hrs" },
    { id: 11, name: "Urine Routine", price: 149, originalPrice: 199, category: "Basic", lab: "DiagnoPlus", description: "Complete urine examination", fasting: false, reportTime: "12 hrs" },
    { id: 12, name: "HbA1c", price: 399, originalPrice: 499, category: "Diabetes", lab: "MedTest Center", description: "Glycated hemoglobin test", fasting: false, reportTime: "24 hrs" }
];

const labsData = [
    { id: 1, name: "HealthCare Labs", rating: 4.5, accreditation: "NABL Accredited", address: "123 Health Street, Medical City", phone: "+91 98765 43210", tests: 150, image: "https://via.placeholder.com/80x80?text=Lab1", type: "lab", timeSlots: ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"] },
    { id: 2, name: "DiagnoPlus", rating: 4.0, accreditation: "ISO Certified", address: "456 Diagnostic Road, Health Park", phone: "+91 98765 43211", tests: 120, image: "https://via.placeholder.com/80x80?text=Lab2", type: "lab", timeSlots: ["6:30 AM", "7:30 AM", "8:30 AM", "9:30 AM", "10:30 AM", "3:00 PM", "4:00 PM", "5:00 PM"] },
    { id: 3, name: "MedTest Center", rating: 5.0, accreditation: "NABL & CAP Accredited", address: "789 Medical Avenue, Care City", phone: "+91 98765 43212", tests: 200, image: "https://via.placeholder.com/80x80?text=Lab3", type: "lab", timeSlots: ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"] },
    { id: 4, name: "PathLab Express", rating: 4.2, accreditation: "NABL Accredited", address: "321 Express Lane, Quick Town", phone: "+91 98765 43213", tests: 100, image: "https://via.placeholder.com/80x80?text=Lab4", type: "lab", timeSlots: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "4:00 PM", "5:00 PM"] },
    { id: 5, name: "City Diagnostics", rating: 4.3, accreditation: "ISO Certified", address: "654 City Center, Metro Area", phone: "+91 98765 43214", tests: 180, image: "https://via.placeholder.com/80x80?text=Lab5", type: "clinic", timeSlots: ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"] },
    { id: 6, name: "Apollo Diagnostics", rating: 4.8, accreditation: "NABL & ISO Certified", address: "987 Apollo Street, Health Hub", phone: "+91 98765 43215", tests: 250, image: "https://via.placeholder.com/80x80?text=Lab6", type: "hospital", timeSlots: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"] },
    { id: 7, name: "Max Healthcare", rating: 4.7, accreditation: "NABL & JCI Accredited", address: "101 Max Road, Health District", phone: "+91 98765 43216", tests: 300, image: "https://via.placeholder.com/80x80?text=Lab7", type: "hospital", timeSlots: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"] },
    { id: 8, name: "Thyrocare", rating: 4.4, accreditation: "NABL Accredited", address: "202 Thyro Street, Lab Area", phone: "+91 98765 43217", tests: 180, image: "https://via.placeholder.com/80x80?text=Lab8", type: "lab", timeSlots: ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"] },
    { id: 9, name: "Dr. Lal PathLabs", rating: 4.6, accreditation: "NABL & CAP Accredited", address: "303 Lal Road, Diagnostic Hub", phone: "+91 98765 43218", tests: 280, image: "https://via.placeholder.com/80x80?text=Lab9", type: "lab", timeSlots: ["6:30 AM", "7:30 AM", "8:30 AM", "9:30 AM", "10:30 AM", "11:30 AM", "2:00 PM", "3:00 PM", "4:00 PM"] },
    { id: 10, name: "Fortis Clinic", rating: 4.5, accreditation: "NABL Accredited", address: "404 Fortis Avenue, Medical Plaza", phone: "+91 98765 43219", tests: 220, image: "https://via.placeholder.com/80x80?text=Lab10", type: "clinic", timeSlots: ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "3:00 PM", "4:00 PM", "5:00 PM"] }
];

// Test to Lab mapping with prices (different labs may have different prices)
const testLabPricing = {
    1: [ // CBC
        { labId: 1, price: 299, reportTime: "24 hrs" },
        { labId: 2, price: 279, reportTime: "24 hrs" },
        { labId: 3, price: 320, reportTime: "12 hrs" },
        { labId: 6, price: 350, reportTime: "6 hrs" },
        { labId: 9, price: 289, reportTime: "24 hrs" }
    ],
    2: [ // Lipid Profile
        { labId: 1, price: 499, reportTime: "24 hrs" },
        { labId: 2, price: 479, reportTime: "24 hrs" },
        { labId: 3, price: 520, reportTime: "12 hrs" },
        { labId: 7, price: 550, reportTime: "6 hrs" },
        { labId: 8, price: 449, reportTime: "24 hrs" }
    ],
    3: [ // Thyroid Profile
        { labId: 1, price: 399, reportTime: "24 hrs" },
        { labId: 3, price: 420, reportTime: "12 hrs" },
        { labId: 6, price: 450, reportTime: "6 hrs" },
        { labId: 8, price: 379, reportTime: "24 hrs" },
        { labId: 9, price: 389, reportTime: "24 hrs" }
    ],
    4: [ // Diabetes Panel
        { labId: 1, price: 599, reportTime: "24 hrs" },
        { labId: 2, price: 579, reportTime: "24 hrs" },
        { labId: 6, price: 650, reportTime: "6 hrs" },
        { labId: 7, price: 620, reportTime: "12 hrs" },
        { labId: 9, price: 559, reportTime: "24 hrs" }
    ],
    5: [ // LFT
        { labId: 2, price: 449, reportTime: "24 hrs" },
        { labId: 3, price: 480, reportTime: "12 hrs" },
        { labId: 5, price: 420, reportTime: "24 hrs" },
        { labId: 6, price: 499, reportTime: "6 hrs" },
        { labId: 10, price: 459, reportTime: "24 hrs" }
    ],
    6: [ // KFT
        { labId: 3, price: 449, reportTime: "24 hrs" },
        { labId: 4, price: 399, reportTime: "24 hrs" },
        { labId: 5, price: 420, reportTime: "24 hrs" },
        { labId: 7, price: 480, reportTime: "12 hrs" },
        { labId: 9, price: 439, reportTime: "24 hrs" }
    ],
    7: [ // Full Body Checkup
        { labId: 1, price: 1499, reportTime: "48 hrs" },
        { labId: 3, price: 1599, reportTime: "24 hrs" },
        { labId: 6, price: 1799, reportTime: "24 hrs" },
        { labId: 7, price: 1899, reportTime: "12 hrs" },
        { labId: 9, price: 1449, reportTime: "48 hrs" }
    ],
    8: [ // Vitamin D
        { labId: 2, price: 599, reportTime: "24 hrs" },
        { labId: 3, price: 650, reportTime: "12 hrs" },
        { labId: 6, price: 699, reportTime: "6 hrs" },
        { labId: 8, price: 549, reportTime: "24 hrs" },
        { labId: 10, price: 579, reportTime: "24 hrs" }
    ],
    9: [ // Vitamin B12
        { labId: 3, price: 499, reportTime: "24 hrs" },
        { labId: 4, price: 449, reportTime: "24 hrs" },
        { labId: 6, price: 550, reportTime: "6 hrs" },
        { labId: 8, price: 469, reportTime: "24 hrs" },
        { labId: 9, price: 479, reportTime: "24 hrs" }
    ],
    10: [ // Iron Studies
        { labId: 1, price: 599, reportTime: "24 hrs" },
        { labId: 2, price: 579, reportTime: "24 hrs" },
        { labId: 5, price: 550, reportTime: "24 hrs" },
        { labId: 7, price: 650, reportTime: "12 hrs" },
        { labId: 9, price: 569, reportTime: "24 hrs" }
    ],
    11: [ // Urine Routine
        { labId: 1, price: 149, reportTime: "12 hrs" },
        { labId: 2, price: 149, reportTime: "12 hrs" },
        { labId: 3, price: 169, reportTime: "6 hrs" },
        { labId: 4, price: 129, reportTime: "12 hrs" },
        { labId: 5, price: 139, reportTime: "12 hrs" }
    ],
    12: [ // HbA1c
        { labId: 3, price: 399, reportTime: "24 hrs" },
        { labId: 6, price: 450, reportTime: "6 hrs" },
        { labId: 7, price: 420, reportTime: "12 hrs" },
        { labId: 8, price: 369, reportTime: "24 hrs" },
        { labId: 9, price: 379, reportTime: "24 hrs" }
    ]
};

const doctorsData = [
    { id: 1, name: "Dr. Kashak Mohan", specialty: "General Physician", qualification: "MBBS, MD", experience: 15, image: "images/Gemini_Generated_Image_7k3prk7k3prk7k3p.png", fee: 500, available: ["Mon", "Wed", "Fri"] },
    { id: 2, name: "Dr. Priya Sharma", specialty: "Pathologist", qualification: "MBBS, MD Pathology", experience: 10, image: "https://randomuser.me/api/portraits/women/44.jpg", fee: 400, available: ["Tue", "Thu", "Sat"] },
    { id: 3, name: "Dr. Amit Patel", specialty: "Diabetologist", qualification: "MBBS, DM", experience: 12, image: "https://randomuser.me/api/portraits/men/52.jpg", fee: 600, available: ["Mon", "Tue", "Wed"] },
    { id: 4, name: "Dr. Sneha Gupta", specialty: "Cardiologist", qualification: "MBBS, DM Cardiology", experience: 8, image: "https://randomuser.me/api/portraits/women/68.jpg", fee: 800, available: ["Thu", "Fri", "Sat"] },
    { id: 5, name: "Dr. Vikram Singh", specialty: "Endocrinologist", qualification: "MBBS, DM Endocrinology", experience: 14, image: "https://randomuser.me/api/portraits/men/45.jpg", fee: 700, available: ["Mon", "Wed", "Sat"] },
    { id: 6, name: "Dr. Neha Agarwal", specialty: "Hematologist", qualification: "MBBS, DM Hematology", experience: 9, image: "https://randomuser.me/api/portraits/women/55.jpg", fee: 650, available: ["Tue", "Thu", "Fri"] }
];

// Store location data in localStorage (static data, not from API)
// NOTE: testsData, labsData, doctorsData are now loaded from the backend API
// Only use localStorage for location data which is static
localStorage.setItem('locationsData', JSON.stringify(locationsData));
localStorage.setItem('testLabPricing', JSON.stringify(testLabPricing));

// ========================================
// Utility Functions
// ========================================

// Format price with INR symbol
function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
}

// Generate star rating HTML
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

// Show toast notification
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
// Authentication Functions
// ========================================

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Login user
function loginUser(email, password, userType = 'patient') {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password && u.userType === userType);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
}

// Register user
function registerUser(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.find(u => u.email === userData.email)) {
        return { success: false, message: 'Email already exists' };
    }

    userData.id = Date.now();
    userData.createdAt = new Date().toISOString();
    users.push(userData);

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(userData));

    return { success: true, user: userData };
}

// Logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = getBasePath() + 'index.html';
}

// Get base path for navigation
function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        return '../../';
    }
    return '';
}

// ========================================
// Location Functions
// ========================================

// Check if location is set
function hasLocationSet() {
    return localStorage.getItem('selectedLocation') !== null;
}

// Get selected location
function getSelectedLocation() {
    const location = localStorage.getItem('selectedLocation');
    return location ? JSON.parse(location) : null;
}

// Set selected location
function setSelectedLocation(location) {
    localStorage.setItem('selectedLocation', JSON.stringify(location));
    updateNavbarLocation();
}

// Clear selected location
function clearSelectedLocation() {
    localStorage.removeItem('selectedLocation');
}

// Search locations
function searchLocations(query) {
    const locations = JSON.parse(localStorage.getItem('locationsData') || '[]');
    const labs = JSON.parse(localStorage.getItem('labsData') || '[]');
    query = query.toLowerCase().trim();

    if (!query) return { locations: [], labs: [] };

    const matchedLocations = locations.filter(loc =>
        loc.city.toLowerCase().includes(query) ||
        loc.pincode.includes(query) ||
        loc.area.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query)
    );

    const matchedLabs = labs.filter(lab =>
        lab.name.toLowerCase().includes(query) ||
        lab.address.toLowerCase().includes(query)
    );

    return { locations: matchedLocations.slice(0, 5), labs: matchedLabs.slice(0, 5) };
}

// Create and show location modal
function showLocationModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('locationModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div class="location-modal-overlay" id="locationModal">
            <div class="location-modal">
                <div class="modal-header">
                    <i class="bi bi-geo-alt-fill"></i>
                    <h3>Select Your Location</h3>
                    <p>To find labs and tests available near you</p>
                </div>

                <div class="location-search-tabs">
                    <button class="tab-btn active" data-tab="pincode">
                        <i class="bi bi-pin-map me-1"></i>Pincode/City
                    </button>
                    <button class="tab-btn" data-tab="lab">
                        <i class="bi bi-building me-1"></i>Lab/Clinic/Hospital
                    </button>
                </div>

                <div class="location-tab-content active" id="pincodeTab">
                    <div class="location-search-input">
                        <i class="bi bi-search"></i>
                        <input type="text" id="pincodeSearch" placeholder="Enter pincode or city name...">
                    </div>
                    <div class="location-suggestions" id="pincodeSuggestions"></div>
                </div>

                <div class="location-tab-content" id="labTab">
                    <div class="location-search-input">
                        <i class="bi bi-search"></i>
                        <input type="text" id="labSearch" placeholder="Search lab, clinic or hospital...">
                    </div>
                    <div class="location-suggestions" id="labSuggestions"></div>
                </div>

                <button class="detect-location-btn" id="detectLocationBtn">
                    <i class="bi bi-crosshair me-2"></i>Detect My Location
                </button>

                <div class="selected-location" id="selectedLocationDisplay">
                    <i class="bi bi-check-circle-fill"></i>
                    <div class="location-details">
                        <strong id="selectedLocationText">Selected Location</strong>
                        <small id="selectedLocationSubtext"></small>
                    </div>
                    <button class="change-btn" id="changeLocationBtn">Change</button>
                </div>

                <button class="confirm-btn" id="confirmLocationBtn" disabled>
                    Confirm Location
                </button>
                <button class="skip-btn" id="skipLocationBtn">
                    Skip for now
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    initLocationModal();
}

// Initialize location modal events
function initLocationModal() {
    const modal = document.getElementById('locationModal');
    const tabBtns = modal.querySelectorAll('.tab-btn');
    const pincodeSearch = document.getElementById('pincodeSearch');
    const labSearch = document.getElementById('labSearch');
    const pincodeSuggestions = document.getElementById('pincodeSuggestions');
    const labSuggestions = document.getElementById('labSuggestions');
    const detectBtn = document.getElementById('detectLocationBtn');
    const confirmBtn = document.getElementById('confirmLocationBtn');
    const skipBtn = document.getElementById('skipLocationBtn');
    const changeBtn = document.getElementById('changeLocationBtn');
    const selectedDisplay = document.getElementById('selectedLocationDisplay');

    let currentSelection = null;

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.location-tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
        });
    });

    // Pincode/City search
    pincodeSearch.addEventListener('input', (e) => {
        const results = searchLocations(e.target.value);
        renderLocationSuggestions(results.locations, pincodeSuggestions, 'location');
    });

    // Lab search
    labSearch.addEventListener('input', (e) => {
        const results = searchLocations(e.target.value);
        renderLabSuggestions(results.labs, labSuggestions);
    });

    // Detect location
    detectBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            detectBtn.innerHTML = '<i class="bi bi-arrow-repeat me-2 spin"></i>Detecting...';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Simulate finding nearest location
                    const locations = JSON.parse(localStorage.getItem('locationsData') || '[]');
                    const nearestLocation = locations[Math.floor(Math.random() * locations.length)];
                    selectLocation({ type: 'location', data: nearestLocation });
                    detectBtn.innerHTML = '<i class="bi bi-crosshair me-2"></i>Detect My Location';
                },
                (error) => {
                    showToast('Unable to detect location. Please search manually.', 'warning');
                    detectBtn.innerHTML = '<i class="bi bi-crosshair me-2"></i>Detect My Location';
                }
            );
        } else {
            showToast('Geolocation is not supported by your browser', 'warning');
        }
    });

    // Select location helper
    function selectLocation(selection) {
        currentSelection = selection;
        selectedDisplay.classList.add('show');

        if (selection.type === 'location') {
            document.getElementById('selectedLocationText').textContent =
                `${selection.data.area}, ${selection.data.city}`;
            document.getElementById('selectedLocationSubtext').textContent =
                `${selection.data.state} - ${selection.data.pincode}`;
        } else if (selection.type === 'lab') {
            document.getElementById('selectedLocationText').textContent = selection.data.name;
            document.getElementById('selectedLocationSubtext').textContent = selection.data.address;
        }

        confirmBtn.disabled = false;
        pincodeSuggestions.classList.remove('show');
        labSuggestions.classList.remove('show');
    }

    // Render location suggestions
    function renderLocationSuggestions(locations, container, type) {
        if (locations.length === 0) {
            container.classList.remove('show');
            return;
        }

        container.innerHTML = locations.map(loc => `
            <div class="location-suggestion-item" data-id="${loc.id}" data-type="location">
                <i class="bi bi-geo-alt"></i>
                <div class="suggestion-text">
                    <strong>${loc.area}, ${loc.city}</strong>
                    <small>${loc.state} - ${loc.pincode}</small>
                </div>
            </div>
        `).join('');

        container.classList.add('show');

        container.querySelectorAll('.location-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const location = locations.find(l => l.id === id);
                selectLocation({ type: 'location', data: location });
            });
        });
    }

    // Render lab suggestions
    function renderLabSuggestions(labs, container) {
        if (labs.length === 0) {
            container.classList.remove('show');
            return;
        }

        container.innerHTML = labs.map(lab => `
            <div class="location-suggestion-item" data-id="${lab.id}" data-type="lab">
                <i class="bi bi-building"></i>
                <div class="suggestion-text">
                    <strong>${lab.name}</strong>
                    <small>${lab.accreditation} | Rating: ${lab.rating}</small>
                </div>
            </div>
        `).join('');

        container.classList.add('show');

        container.querySelectorAll('.location-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const lab = labs.find(l => l.id === id);
                selectLocation({ type: 'lab', data: lab });
            });
        });
    }

    // Change location
    changeBtn.addEventListener('click', () => {
        currentSelection = null;
        selectedDisplay.classList.remove('show');
        confirmBtn.disabled = true;
        pincodeSearch.value = '';
        labSearch.value = '';
    });

    // Confirm location
    confirmBtn.addEventListener('click', () => {
        if (currentSelection) {
            setSelectedLocation(currentSelection);
            modal.remove();
            showToast('Location set successfully!', 'success');
        }
    });

    // Skip
    skipBtn.addEventListener('click', () => {
        localStorage.setItem('locationSkipped', 'true');
        modal.remove();
    });
}

// Update navbar with location
function updateNavbarLocation() {
    const location = getSelectedLocation();
    const existingLocationEl = document.querySelector('.navbar-location');

    if (existingLocationEl) {
        if (location) {
            const text = location.type === 'location'
                ? `${location.data.area}, ${location.data.city}`
                : location.data.name;
            existingLocationEl.querySelector('.location-text').textContent = text;
        }
    }
}

// Create auth required modal
function showAuthRequiredModal(redirectUrl = null) {
    const existingModal = document.getElementById('authRequiredModal');
    if (existingModal) {
        existingModal.remove();
    }

    const basePath = getBasePath();
    const loginUrl = redirectUrl
        ? `${basePath}pages/patient/login.html?redirect=${encodeURIComponent(redirectUrl)}`
        : `${basePath}pages/patient/login.html`;
    const signupUrl = redirectUrl
        ? `${basePath}pages/patient/signup.html?redirect=${encodeURIComponent(redirectUrl)}`
        : `${basePath}pages/patient/signup.html`;

    const modalHTML = `
        <div class="auth-required-modal show" id="authRequiredModal">
            <div class="auth-required-content">
                <i class="bi bi-person-lock"></i>
                <h4>Sign In Required</h4>
                <p>Please sign in or create an account to add tests to your cart and book appointments.</p>
                <div class="btn-group">
                    <a href="${loginUrl}" class="btn btn-primary">Sign In</a>
                    <a href="${signupUrl}" class="btn btn-outline-primary">Sign Up</a>
                </div>
                <button class="skip-btn" onclick="closeAuthModal()">Cancel</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('authRequiredModal');
    if (modal) {
        modal.remove();
    }
}

// ========================================
// Booking Functions
// ========================================

// Add to cart with authentication check
function addToCart(testId, labId = null) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        // Store intended action for after login
        localStorage.setItem('pendingCartAction', JSON.stringify({ testId, labId }));
        showAuthRequiredModal(window.location.href);
        return false;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const tests = JSON.parse(localStorage.getItem('testsData') || '[]');
    const test = tests.find(t => t.id === testId);

    if (test && !cart.find(item => item.id === testId)) {
        // If labId is provided, add lab-specific pricing
        if (labId) {
            const testLabPricing = JSON.parse(localStorage.getItem('testLabPricing') || '{}');
            const labPricing = testLabPricing[testId]?.find(p => p.labId === labId);
            const labs = JSON.parse(localStorage.getItem('labsData') || '[]');
            const lab = labs.find(l => l.id === labId);

            if (labPricing && lab) {
                test.selectedLab = lab;
                test.selectedPrice = labPricing.price;
                test.selectedReportTime = labPricing.reportTime;
            }
        }

        cart.push(test);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast('Test added to cart!', 'success');
        return true;
    } else if (cart.find(item => item.id === testId)) {
        showToast('Test already in cart', 'warning');
        return false;
    }
    return false;
}

// Remove from cart
function removeFromCart(testId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== testId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Test removed from cart', 'info');
}

// Get cart items
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.price, 0);
}

// Update cart count in navbar
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cart = getCart();
    cartCountElements.forEach(el => {
        el.textContent = cart.length;
        el.style.display = cart.length > 0 ? 'inline-block' : 'none';
    });
}

// Create booking
function createBooking(bookingData) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const user = getCurrentUser();

    const booking = {
        id: 'BK' + Date.now(),
        ...bookingData,
        userId: user?.id,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    localStorage.removeItem('cart'); // Clear cart after booking

    return booking;
}

// Get user bookings
function getUserBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const user = getCurrentUser();

    if (!user) return [];
    return bookings.filter(b => b.userId === user.id);
}

// ========================================
// Admin Functions
// ========================================

// Add new test
function addTest(testData) {
    const tests = JSON.parse(localStorage.getItem('testsData') || '[]');
    testData.id = tests.length + 1;
    tests.push(testData);
    localStorage.setItem('testsData', JSON.stringify(tests));
    return testData;
}

// Update test
function updateTest(testId, testData) {
    let tests = JSON.parse(localStorage.getItem('testsData') || '[]');
    const index = tests.findIndex(t => t.id === testId);
    if (index !== -1) {
        tests[index] = { ...tests[index], ...testData };
        localStorage.setItem('testsData', JSON.stringify(tests));
        return tests[index];
    }
    return null;
}

// Delete test
function deleteTest(testId) {
    let tests = JSON.parse(localStorage.getItem('testsData') || '[]');
    tests = tests.filter(t => t.id !== testId);
    localStorage.setItem('testsData', JSON.stringify(tests));
    return true;
}

// Add new lab
function addLab(labData) {
    const labs = JSON.parse(localStorage.getItem('labsData') || '[]');
    labData.id = labs.length + 1;
    labs.push(labData);
    localStorage.setItem('labsData', JSON.stringify(labs));
    return labData;
}

// Add new doctor
function addDoctor(doctorData) {
    const doctors = JSON.parse(localStorage.getItem('doctorsData') || '[]');
    doctorData.id = doctors.length + 1;
    doctors.push(doctorData);
    localStorage.setItem('doctorsData', JSON.stringify(doctors));
    return doctorData;
}

// Get all bookings (admin)
function getAllBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Update booking status
function updateBookingStatus(bookingId, status, collectorId = null) {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index !== -1) {
        bookings[index].status = status;
        if (collectorId) {
            bookings[index].collectorId = collectorId;
        }
        if (status === 'collected') {
            bookings[index].collectedAt = new Date().toISOString();
        }
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return bookings[index];
    }
    return null;
}

// ========================================
// Collector Functions
// ========================================

// Get assigned collections for collector
function getAssignedCollections(collectorId) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    return bookings.filter(b => b.collectorId === collectorId);
}

// ========================================
// Get labs with availability for a test
// ========================================
function getLabsForTest(testId) {
    const testLabPricing = JSON.parse(localStorage.getItem('testLabPricing') || '{}');
    const labs = JSON.parse(localStorage.getItem('labsData') || '[]');
    const pricing = testLabPricing[testId] || [];

    return pricing.map(p => {
        const lab = labs.find(l => l.id === p.labId);
        if (lab) {
            return {
                ...lab,
                testPrice: p.price,
                reportTime: p.reportTime
            };
        }
        return null;
    }).filter(Boolean);
}

// ========================================
// Render test card with lab availability
// ========================================
function renderTestCardWithLabs(test) {
    const labsForTest = getLabsForTest(test.id);
    const discount = test.originalPrice ? Math.round((1 - test.price / test.originalPrice) * 100) : 0;

    let labsHTML = '';
    if (labsForTest.length > 0) {
        labsHTML = `
            <div class="lab-availability-section">
                <h6><i class="bi bi-building me-1"></i>Available at ${labsForTest.length} Labs</h6>
                <div class="lab-availability-list">
                    ${labsForTest.slice(0, 3).map(lab => `
                        <div class="lab-availability-item" data-lab-id="${lab.id}" data-test-id="${test.id}">
                            <div class="lab-info">
                                <div class="lab-name">${lab.name}</div>
                                <div class="lab-rating">
                                    <i class="bi bi-star-fill"></i> ${lab.rating} | ${lab.accreditation.split(' ')[0]}
                                </div>
                            </div>
                            <div class="lab-timing">
                                <div class="lab-price">${formatPrice(lab.testPrice)}</div>
                                <div class="lab-time"><i class="bi bi-clock"></i> ${lab.reportTime}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${labsForTest.length > 3 ? `<button class="btn btn-link btn-sm p-0 mt-2" onclick="showAllLabs(${test.id})">View all ${labsForTest.length} labs</button>` : ''}
            </div>
        `;
    }

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card test-card-enhanced h-100 position-relative">
                ${discount > 0 ? `<span class="badge bg-danger" style="position: absolute; top: 15px; right: 15px;">${discount}% OFF</span>` : ''}
                <div class="test-card-header">
                    <h5 class="card-title">${test.name}</h5>
                    <p class="text-muted mb-3">${test.description}</p>
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="price">${formatPrice(test.price)}</span>
                        ${test.originalPrice ? `<span class="original-price">${formatPrice(test.originalPrice)}</span>` : ''}
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <span class="badge bg-light text-dark"><i class="bi bi-clock me-1"></i>${test.reportTime}</span>
                        <span class="badge bg-light text-dark"><i class="bi bi-${test.fasting ? 'check' : 'x'}-circle me-1"></i>${test.fasting ? 'Fasting Required' : 'No Fasting'}</span>
                    </div>
                </div>
                <div class="test-card-body">
                    ${labsHTML}
                    <button class="btn btn-primary w-100 mt-3" onclick="addToCart(${test.id})">
                        <i class="bi bi-cart-plus me-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Show all labs modal for a test
function showAllLabs(testId) {
    const tests = JSON.parse(localStorage.getItem('testsData') || '[]');
    const test = tests.find(t => t.id === testId);
    const labsForTest = getLabsForTest(testId);

    if (!test || labsForTest.length === 0) return;

    const existingModal = document.getElementById('allLabsModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div class="location-modal-overlay" id="allLabsModal">
            <div class="location-modal" style="max-width: 600px;">
                <div class="modal-header">
                    <i class="bi bi-building"></i>
                    <h3>Select Lab for ${test.name}</h3>
                    <p>Choose from ${labsForTest.length} available labs</p>
                </div>
                <div class="lab-availability-list" style="max-height: 400px;">
                    ${labsForTest.map(lab => `
                        <div class="lab-availability-item" onclick="selectLabAndAddToCart(${test.id}, ${lab.id})">
                            <div class="lab-info">
                                <div class="lab-name">${lab.name}</div>
                                <div class="lab-rating">
                                    <i class="bi bi-star-fill text-warning"></i> ${lab.rating} | ${lab.accreditation}
                                </div>
                                <small class="text-muted">${lab.address}</small>
                            </div>
                            <div class="lab-timing">
                                <div class="lab-price">${formatPrice(lab.testPrice)}</div>
                                <div class="lab-time"><i class="bi bi-clock"></i> ${lab.reportTime}</div>
                                <div class="time-slots mt-2">
                                    ${lab.timeSlots.slice(0, 4).map(slot => `<span class="time-slot">${slot}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="skip-btn" onclick="document.getElementById('allLabsModal').remove()">Close</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Select lab and add to cart
function selectLabAndAddToCart(testId, labId) {
    const modal = document.getElementById('allLabsModal');
    if (modal) modal.remove();
    addToCart(testId, labId);
}

// Check for pending cart action after login
function processPendingCartAction() {
    const pending = localStorage.getItem('pendingCartAction');
    if (pending && isLoggedIn()) {
        const action = JSON.parse(pending);
        localStorage.removeItem('pendingCartAction');
        addToCart(action.testId, action.labId);
    }
}

// ========================================
// Initialize on page load
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count
    updateCartCount();

    // Process any pending cart action
    processPendingCartAction();

    // Initialize any tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0) {
        tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
    }

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-lg');
            } else {
                navbar.classList.remove('shadow-lg');
            }
        }
    });

    // Show location modal on first visit (only on home page)
    const isHomePage = window.location.pathname.endsWith('index.html') ||
                       window.location.pathname === '/' ||
                       window.location.pathname.endsWith('/');

    if (isHomePage && !hasLocationSet() && !localStorage.getItem('locationSkipped')) {
        // Small delay to let page render first
        setTimeout(() => {
            showLocationModal();
        }, 500);
    }

    // Update navbar location if set
    updateNavbarLocation();

    // Initialize demo admin user if not exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.find(u => u.email === 'admin@testmyblood.com')) {
        users.push({
            id: 1,
            name: 'Admin',
            email: 'admin@testmyblood.com',
            password: 'admin123',
            userType: 'admin',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Initialize demo collector if not exists
    if (!users.find(u => u.email === 'collector@testmyblood.com')) {
        const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        updatedUsers.push({
            id: 2,
            name: 'John Collector',
            email: 'collector@testmyblood.com',
            password: 'collector123',
            phone: '+91 98765 43210',
            area: 'Central Zone',
            userType: 'collector',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
});

// Export functions for use in other files
window.TestMyBlood = {
    formatPrice,
    generateStars,
    showToast,
    isLoggedIn,
    getCurrentUser,
    loginUser,
    registerUser,
    logoutUser,
    getBasePath,
    addToCart,
    removeFromCart,
    getCart,
    getCartTotal,
    createBooking,
    getUserBookings,
    addTest,
    updateTest,
    deleteTest,
    addLab,
    addDoctor,
    getAllBookings,
    updateBookingStatus,
    getAssignedCollections,
    // Location functions
    hasLocationSet,
    getSelectedLocation,
    setSelectedLocation,
    clearSelectedLocation,
    searchLocations,
    showLocationModal,
    updateNavbarLocation,
    // Auth modal
    showAuthRequiredModal,
    closeAuthModal,
    // Lab availability
    getLabsForTest,
    renderTestCardWithLabs,
    showAllLabs,
    selectLabAndAddToCart,
    processPendingCartAction
};

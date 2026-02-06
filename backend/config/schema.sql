-- ========================================
-- Test My Blood - MySQL Database Schema
-- ========================================

-- Create Database
CREATE DATABASE IF NOT EXISTS testmyblood;
USE testmyblood;

-- ========================================
-- Users Table (Patients, Collectors, Admins)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('patient', 'collector', 'admin') DEFAULT 'patient',
    gender ENUM('male', 'female', 'other'),
    dob DATE,
    blood_group VARCHAR(10),
    profile_image VARCHAR(255),
    -- Address fields
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    -- Collector specific
    area VARCHAR(100),
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Labs Table
-- ========================================
CREATE TABLE IF NOT EXISTS labs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    accreditation VARCHAR(100),
    rating DECIMAL(2,1) DEFAULT 4.0,
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    tests_count INT DEFAULT 0,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Tests Table
-- ========================================
CREATE TABLE IF NOT EXISTS tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50),
    lab_id INT,
    report_time VARCHAR(50) DEFAULT '24 hrs',
    fasting_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE SET NULL
);

-- ========================================
-- Doctors Table
-- ========================================
CREATE TABLE IF NOT EXISTS doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    qualification VARCHAR(150),
    experience INT DEFAULT 0,
    fee DECIMAL(10,2),
    image VARCHAR(255),
    available_days VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Payments Table (Razorpay Integration)
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status ENUM('created', 'attempted', 'paid', 'failed', 'refunded') DEFAULT 'created',
    method VARCHAR(50),
    bank VARCHAR(100),
    wallet VARCHAR(50),
    vpa VARCHAR(100),
    error_code VARCHAR(50),
    error_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Bookings Table
-- ========================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    patient_name VARCHAR(100),
    phone VARCHAR(20),
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    pincode VARCHAR(10),
    -- Schedule
    booking_date DATE NOT NULL,
    time_slot VARCHAR(20),
    -- Assignment
    collector_id INT,
    -- Financial
    total_amount DECIMAL(10,2),
    discount DECIMAL(10,2) DEFAULT 0,
    -- Payment Status
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_id INT,
    -- Status
    status ENUM('pending', 'confirmed', 'collected', 'completed', 'cancelled') DEFAULT 'pending',
    -- Report
    report_url VARCHAR(255),
    report_file VARCHAR(255),
    report_notes TEXT,
    -- Timestamps
    collected_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- ========================================
-- Booking Tests (Many-to-Many)
-- ========================================
CREATE TABLE IF NOT EXISTS booking_tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    test_id INT NOT NULL,
    test_name VARCHAR(150),
    test_price DECIMAL(10,2),
    lab_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- ========================================
-- Doctor Appointments Table
-- ========================================
CREATE TABLE IF NOT EXISTS doctor_appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(20),
    reason TEXT,
    fee DECIMAL(10,2),
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
    prescription_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- ========================================
-- Contact Messages Table
-- ========================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    subject VARCHAR(100),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Notifications Table (Email/SMS Tracking)
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    booking_id INT,
    type ENUM('email', 'sms') DEFAULT 'email',
    template VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- ========================================
-- Reports Table (Uploaded Report Files)
-- ========================================
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- Insert Default Admin
-- ========================================
INSERT INTO users (name, email, password, phone, user_type, is_verified) VALUES
('Admin', 'admin@testmyblood.com', '$2a$10$XQCg1z4YZ1Z1Z1Z1Z1Z1Z.abcdefghijklmnopqrstuvwxyz123456', '+91 98765 43210', 'admin', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- ========================================
-- Insert Default Collector
-- ========================================
INSERT INTO users (name, email, password, phone, user_type, area, is_verified) VALUES
('John Collector', 'collector@testmyblood.com', '$2a$10$XQCg1z4YZ1Z1Z1Z1Z1Z1Z.abcdefghijklmnopqrstuvwxyz123456', '+91 98765 43211', 'collector', 'Central Zone', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- ========================================
-- Insert Sample Labs
-- ========================================
INSERT INTO labs (name, accreditation, rating, address, phone, tests_count, image) VALUES
('HealthCare Labs', 'NABL Accredited', 4.5, '123 Health Street, Medical City', '+91 98765 43210', 150, 'https://via.placeholder.com/80x80?text=Lab1'),
('DiagnoPlus', 'ISO Certified', 4.0, '456 Diagnostic Road, Health Park', '+91 98765 43211', 120, 'https://via.placeholder.com/80x80?text=Lab2'),
('MedTest Center', 'NABL & CAP Accredited', 5.0, '789 Medical Avenue, Care City', '+91 98765 43212', 200, 'https://via.placeholder.com/80x80?text=Lab3'),
('PathLab Express', 'NABL Accredited', 4.2, '321 Express Lane, Quick Town', '+91 98765 43213', 100, 'https://via.placeholder.com/80x80?text=Lab4'),
('City Diagnostics', 'ISO Certified', 4.3, '654 City Center, Metro Area', '+91 98765 43214', 180, 'https://via.placeholder.com/80x80?text=Lab5'),
('Apollo Diagnostics', 'NABL & ISO Certified', 4.8, '987 Apollo Street, Health Hub', '+91 98765 43215', 250, 'https://via.placeholder.com/80x80?text=Lab6')
ON DUPLICATE KEY UPDATE name=name;

-- ========================================
-- Insert Sample Tests
-- ========================================
INSERT INTO tests (name, description, price, original_price, category, lab_id, report_time, fasting_required) VALUES
('Complete Blood Count (CBC)', 'Measures red cells, white cells, hemoglobin, and platelets', 299, 399, 'Basic', 1, '24 hrs', FALSE),
('Lipid Profile', 'Complete cholesterol test including HDL, LDL, and triglycerides', 499, 699, 'Heart', 2, '24 hrs', TRUE),
('Thyroid Profile (T3, T4, TSH)', 'Complete thyroid function test', 399, 599, 'Thyroid', 3, '24 hrs', FALSE),
('Diabetes Panel (HbA1c + FBS)', 'Blood sugar monitoring with 3-month average', 599, 799, 'Diabetes', 1, '24 hrs', TRUE),
('Liver Function Test (LFT)', 'Complete liver health assessment', 449, 649, 'Liver', 2, '24 hrs', FALSE),
('Kidney Function Test (KFT)', 'Comprehensive kidney function assessment', 449, 649, 'Kidney', 3, '24 hrs', FALSE),
('Full Body Checkup', '70+ parameters comprehensive health check', 1499, 2199, 'Package', 1, '48 hrs', TRUE),
('Vitamin D Test', '25-Hydroxy Vitamin D level test', 599, 899, 'Vitamin', 2, '24 hrs', FALSE),
('Vitamin B12 Test', 'Serum Vitamin B12 level test', 499, 699, 'Vitamin', 3, '24 hrs', FALSE),
('Iron Studies', 'Serum Iron, TIBC, Ferritin', 599, 799, 'Basic', 1, '24 hrs', TRUE),
('Urine Routine', 'Complete urine examination', 149, 199, 'Basic', 2, '12 hrs', FALSE),
('HbA1c', 'Glycated hemoglobin test', 399, 499, 'Diabetes', 3, '24 hrs', FALSE)
ON DUPLICATE KEY UPDATE name=name;

-- ========================================
-- Insert Sample Doctors
-- ========================================
INSERT INTO doctors (name, specialty, qualification, experience, fee, image, available_days) VALUES
('Dr. Kashak Mohan(Kallu)', 'General Physician', 'MBBS, MD', 15, 500, 'https://randomuser.me/api/portraits/men/32.jpg', 'Mon,Wed,Fri'),
('Dr. Priya Sharma', 'Pathologist', 'MBBS, MD Pathology', 10, 400, 'https://randomuser.me/api/portraits/women/44.jpg', 'Tue,Thu,Sat'),
('Dr. Amit Patel', 'Diabetologist', 'MBBS, DM', 12, 600, 'https://randomuser.me/api/portraits/men/52.jpg', 'Mon,Tue,Wed'),
('Dr. Sneha Gupta', 'Cardiologist', 'MBBS, DM Cardiology', 8, 800, 'https://randomuser.me/api/portraits/women/68.jpg', 'Thu,Fri,Sat'),
('Dr. Vikram Singh', 'Endocrinologist', 'MBBS, DM Endocrinology', 14, 700, 'https://randomuser.me/api/portraits/men/45.jpg', 'Mon,Wed,Sat'),
('Dr. Neha Agarwal', 'Hematologist', 'MBBS, DM Hematology', 9, 650, 'https://randomuser.me/api/portraits/women/55.jpg', 'Tue,Thu,Fri')
ON DUPLICATE KEY UPDATE name=name;

-- ========================================
-- Create Indexes for Better Performance
-- ========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_collector ON bookings(collector_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_tests_category ON tests(category);
CREATE INDEX idx_tests_lab ON tests(lab_id);
CREATE INDEX idx_payments_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_booking ON notifications(booking_id);
CREATE INDEX idx_reports_booking ON reports(booking_id);

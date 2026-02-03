const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/specialties', doctorController.getSpecialties);
router.get('/:id', doctorController.getDoctorById);

// Protected routes (Patient)
router.post('/appointments', verifyToken, doctorController.bookAppointment);
router.get('/appointments/my', verifyToken, doctorController.getUserAppointments);

// Admin routes
router.post('/', verifyToken, isAdmin, doctorController.createDoctor);
router.put('/:id', verifyToken, isAdmin, doctorController.updateDoctor);
router.delete('/:id', verifyToken, isAdmin, doctorController.deleteDoctor);

module.exports = router;

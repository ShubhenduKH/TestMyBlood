const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, isAdmin, isCollector, isAdminOrCollector } = require('../middleware/auth');

// Patient routes
router.post('/', verifyToken, bookingController.createBooking);
router.get('/my', verifyToken, bookingController.getUserBookings);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);

// Collector routes
router.get('/collector/assigned', verifyToken, isCollector, bookingController.getCollectorBookings);
router.put('/:id/collect', verifyToken, isCollector, (req, res, next) => {
    req.body.status = 'collected';
    bookingController.updateBookingStatus(req, res, next);
});

// Admin routes
router.get('/', verifyToken, isAdmin, bookingController.getAllBookings);
router.put('/:id/status', verifyToken, isAdminOrCollector, bookingController.updateBookingStatus);
router.put('/:id/assign', verifyToken, isAdmin, bookingController.assignCollector);

// Report upload with file support (Admin)
router.put('/:id/report', verifyToken, isAdmin, bookingController.uploadMiddleware, bookingController.uploadReport);

// Report download (Patient/Admin)
router.get('/:id/download', verifyToken, bookingController.downloadReport);

module.exports = router;

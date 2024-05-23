const express = require('express');
const { getAllReports, updateReport, createReport } = require('../controllers/reportController');
const { verifyToken, verifyAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

// Route to get all reports (Admin only)
router.get('/', verifyToken,verifyAdmin, getAllReports);

// Route to update a report (Admin only)
router.put('/:id', verifyToken, verifyAdmin, updateReport);

// Route to create a report
router.post('/', verifyToken, createReport);

module.exports = router;


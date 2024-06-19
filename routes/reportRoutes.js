const express = require('express');
const { getAllReports, updateReport, createReport } = require('../controllers/reportController');
const { verifyToken, verifyAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', verifyToken,verifyAdmin, getAllReports);
router.put('/:id', verifyToken, verifyAdmin, updateReport);
router.post('/', verifyToken, createReport);

module.exports = router;


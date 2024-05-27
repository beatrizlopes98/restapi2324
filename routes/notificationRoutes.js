const express = require('express');
const notificationController= require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, notificationController.getNotifications);
router.patch('/:id', verifyToken, notificationController.markAsRead);

module.exports = router;

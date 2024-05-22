const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', eventController.getAllEvents);
router.get('/:id', authMiddleware.verifyToken, eventController.getEventById);
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, eventController.createEvent);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, eventController.updateEventById);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, eventController.deleteEventById);

module.exports = router;
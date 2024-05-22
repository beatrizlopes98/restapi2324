const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.use(eventController.verifyToken);

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent); // Admin only
router.put('/:id', eventController.updateEvent); // Admin only
router.delete('/:id', eventController.deleteEvent); // Admin only

module.exports = router;
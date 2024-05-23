const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', eventController.getAllEvents);
router.get('/:id', authMiddleware.verifyToken, eventController.getEventById);
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, eventController.createEvent);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, eventController.updateEventById);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, eventController.deleteEventById);
router.post('/:id/like', authMiddleware.verifyToken, authMiddleware.verifyAlumni, eventController.likeEvent); // Like an event
router.delete('/:id/like', authMiddleware.verifyToken, authMiddleware.verifyAlumni, eventController.deleteLikeEvent);
router.post('/:id/apply', authMiddleware.verifyToken, authMiddleware.verifyAlumni, eventController.applyForEvent); // Apply for an event

module.exports = router;
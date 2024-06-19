const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const {verifyAdmin, verifyToken, verifyAlumni}= require('../middlewares/authMiddleware');

router.get('/', eventController.getAllEvents);
router.get('/:id', verifyToken, eventController.getEventById);
router.post('/', verifyToken, verifyAdmin, eventController.createEvent);
router.put('/:id', verifyToken, verifyAdmin, eventController.updateEventById);
router.delete('/:id', verifyToken, verifyAdmin, eventController.deleteEventById);
router.post('/:id/likes', verifyToken, verifyAlumni, eventController.likeEvent); 
router.delete('/:id/likes', verifyToken, verifyAlumni, eventController.deleteLikeEvent);
router.post('/:id/applications', verifyToken, verifyAlumni, eventController.applyForEvent);

module.exports = router;
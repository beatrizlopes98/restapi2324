const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', alumniController.getAllAlumni);
router.get('/:id', alumniController.getAlumniById);
router.put('/:id', authMiddleware.verifyToken, alumniController.updateAlumniById);
router.delete('/:id', authMiddleware.verifyToken, alumniController.deleteAlumniById);
router.post('/:id/follow', authMiddleware.verifyToken, authMiddleware.verifyAlumni, alumniController.followAlumni);
router.post('/:id/unfollow', authMiddleware.verifyToken, authMiddleware.verifyAlumni, alumniController.unfollowAlumni);

module.exports = router;

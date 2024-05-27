const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const authMiddleware = require('../middlewares/authMiddleware');

function validatePercurso(req, res, next) {
    const percurso = req.body.percurso;

    // If percurso is not provided, skip validation
    if (!percurso) {
        return next();
    }

    const { startYear, endYear } = percurso;

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Check if startYear is provided and valid (not in the future)
    if (startYear !== undefined) {
        if (startYear > currentYear) {
            return res.status(400).json({ success: false, msg: 'Start year cannot be in the future. If you are currently working on this company, leave the endYear field empty.' });
        }
    }

    // Check if endYear is provided and valid (not in the future)
    if (endYear !== undefined) {
        if (endYear > currentYear) {
            return res.status(400).json({ success: false, msg: 'End year cannot be in the future. If you are currently working on this company, leave the endYear field empty.' });
        }
    }

    // Check if endYear is provided and not before startYear
    if (endYear !== undefined && startYear !== undefined && endYear < startYear) {
        return res.status(400).json({ success: false, msg: 'End year cannot be before start year.' });
    }

    // If no validation errors, proceed to the next middleware or route handler
    next();
}




router.get('/', alumniController.getAllAlumni);
router.get('/:id',authMiddleware.verifyToken, alumniController.getAlumniById);
router.put('/:id', authMiddleware.verifyToken, validatePercurso, alumniController.updateAlumniById);
router.delete('/:id', authMiddleware.verifyToken, alumniController.deleteAlumniById);
router.post('/:id/follow', authMiddleware.verifyToken, authMiddleware.verifyAlumni, alumniController.followAlumni);
router.post('/:id/unfollow', authMiddleware.verifyToken, authMiddleware.verifyAlumni, alumniController.unfollowAlumni);

module.exports = router;

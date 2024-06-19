const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const authMiddleware = require('../middlewares/authMiddleware');

function validatePercurso(req, res, next) {
    const percurso = req.body.percurso;
    if (!percurso) {
        return next();
    }

    const { startYear, endYear } = percurso;

    const currentYear = new Date().getFullYear();

    if (startYear !== undefined) {
        if (startYear > currentYear) {
            return res.status(400).json({ success: false, msg: 'Start year cannot be in the future. If you are currently working on this company, leave the endYear field empty.' });
        }
    }
    if (endYear !== undefined) {
        if (endYear > currentYear) {
            return res.status(400).json({ success: false, msg: 'End year cannot be in the future. If you are currently working on this company, leave the endYear field empty.' });
        }
    }

    if (endYear !== undefined && startYear !== undefined && endYear < startYear) {
        return res.status(400).json({ success: false, msg: 'End year cannot be before start year.' });
    }
    next();
}




router.get('/', alumniController.getAllAlumni);
router.get('/:id',authMiddleware.verifyToken, alumniController.getAlumniById);
router.put('/:id', authMiddleware.verifyToken, validatePercurso, alumniController.updateAlumniById);
router.delete('/:id', authMiddleware.verifyToken, alumniController.deleteAlumniById);
router.post('/followers/:id', authMiddleware.verifyToken, authMiddleware.verifyAlumni, alumniController.followAlumni);
router.delete('/followers/:id', authMiddleware.verifyToken, authMiddleware.verifyAlumni, alumniController.unfollowAlumni);

module.exports = router;

const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const { verifyToken } = require('../controllers/userController'); // Assuming you have a token verification middleware

// Get all alumni (public)
router.get('/', alumniController.getAllAlumni);

// Get alumni by id (auth)
router.get('/:id', verifyToken, alumniController.getAlumniById);

// Update alumni by id (auth)
router.put('/:id', verifyToken, alumniController.updateAlumniById);

// Delete alumni by id (auth)
router.delete('/:id', verifyToken, alumniController.deleteAlumniById);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/alumnis', userController.register);
router.post('/login', userController.login);

module.exports = router;


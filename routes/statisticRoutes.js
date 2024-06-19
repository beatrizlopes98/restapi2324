const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticController');

router.get('/gender', statisticsController.getGenderStatistics);
router.get('/location', statisticsController.getLocationStatistics);
router.get('/employment', statisticsController.getEmploymentStatistics);
router.get('/role', statisticsController.getRoleStatistics);

module.exports = router;

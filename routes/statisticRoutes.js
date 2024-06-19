const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticController');

router.get('/genders', statisticsController.getGenderStatistics);
router.get('/locations', statisticsController.getLocationStatistics);
router.get('/employes', statisticsController.getEmploymentStatistics);
router.get('/roles', statisticsController.getRoleStatistics);

module.exports = router;

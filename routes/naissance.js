var express = require('express');
var router = express.Router();
const naissanceController = require('../controllers/naissanceController')

//get maladie by
router.get('/province/:province', naissanceController.getNaissanceByProvince);
router.get('/territoire/:territoire', naissanceController.getNaissanceByDistrict);
router.get('/ville/:ville', naissanceController.getNaissanceByVille);
router.get('/localite/:localite', naissanceController.getNaissanceByLocalite);

module.exports = router;
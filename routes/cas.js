var express = require('express');
var router = express.Router();
const casController = require('../controllers/casController');

router.post('/', casController.postCas);
router.get('/localite/:localite/:maladie', casController.getLocMaladie);
router.get('/territoire/:territoire/:maladie', casController.getTerritoireMaladie);
router.get('/ville/:ville/:maladie', casController.getVilleMaladie);
router.get('/provincegeo/:province/:maladie', casController.getProvinceMaladie);
router.get('/province/:province/:maladie', casController.getProvince);

module.exports = router;
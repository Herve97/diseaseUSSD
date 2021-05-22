var express = require('express');
var router = express.Router();
const zoneSanteController = require('../controllers/zoneSanteController')

//Post add User
router.post('/', zoneSanteController.postZoneSante);

module.exports = router;
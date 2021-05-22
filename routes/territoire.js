var express = require('express');
var router = express.Router();
const territoireController = require('../controllers/territoireController')

//Post add User
router.post('/', territoireController.postTerritoire);

module.exports = router;
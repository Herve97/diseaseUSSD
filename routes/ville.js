var express = require('express');
var router = express.Router();
const villeController = require('../controllers/villeController')

//Post add User
router.post('/', villeController.postVille);

module.exports = router;
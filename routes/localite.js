var express = require('express');
var router = express.Router();
const localiteController = require('../controllers/localiteController')

//Post add User
router.post('/', localiteController.postLocalite);

module.exports = router;
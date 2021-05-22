var express = require('express');
var router = express.Router();
const provinceController = require('../controllers/provinceController')

//Post add User
router.post('/', provinceController.postProvince);

module.exports = router;
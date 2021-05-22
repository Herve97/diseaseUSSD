var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')

//Post add User
router.post('/', userController.signUp);

module.exports = router;
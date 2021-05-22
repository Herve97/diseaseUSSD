var express = require('express');
var router = express.Router();
const maladieController = require('../controllers/maladieController')

//get maladie by
router.post('/', maladieController.postMaladie);


module.exports = router;
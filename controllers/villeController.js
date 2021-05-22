const Cas = require('../models/Cas');
const Province = require('../models/Province');
const Localite = require('../models/Localite');
const Territoire = require('../models/Territoire');
const Ville = require('../models/Ville');
const ZoneSante = require('../models/ZoneSante');
const Maladie = require('../models/Maladie');
const fs = require('fs');


exports.postVille = async (req, res, next) => {

  const { code, nom, lat, long, province } = req.body
  
  const VilleExist = await Ville.findOne({ code: code, nom: nom, province: province });

  if (VilleExist) {
    res.status(400).json({ "error": 'Ville already Exist' });
  } else {
    const ville = new Ville({
      code: code,
      nom: nom,
      lat: lat,
      long: long
    });

    let foundProvince = await Province.find({nom: req.body.province});
  foundProvince = foundProvince["0"];
  cas.province = foundProvince;

    ville.save().then(async (result) => {

      foundProvince.cas.push(result._id);
      let provinceSave = await foundProvince.save();
      
      res.status(200).json({region: result, message: "Ville saved", pushing: provinceSave});
    }).catch((error) => {
      res.status(400).json({ 'error': error })
    });

  }

}
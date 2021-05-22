const Cas = require('../models/Cas');
const Province = require('../models/Province');
const Localite = require('../models/Localite');
const Territoire = require('../models/Territoire');
const Ville = require('../models/Ville');
const ZoneSante = require('../models/ZoneSante');
const Maladie = require('../models/Maladie');
const fs = require('fs');

exports.postProvince = async (req, res, next) => {

    const { code, nom, lat, long } = req.body

    const ProvinceExist = await Province.findOne({ code: code, nom: nom });

    if (ProvinceExist) {
        res.status(400).json({ "error": 'Province already Exist' });
    } else {
        const province = new Province({
            code: code,
            nom: nom,
            lat: lat,
            long: long
        });

        let foundMaladie = await Maladie.find({maladie: req.body.maladie});
        foundMaladie = foundMaladie["0"];
        localite.maladie = foundMaladie;

        province.save().then(async (result) => {
            foundMaladie.province.push(result._id);
            let maladieSave = await foundMaladie.save();
            res.status(200).json({province: result, message: "Province saved"});
        }).catch((error) => {
            res.status(400).json({ 'error': error.message });
        });
    }
}

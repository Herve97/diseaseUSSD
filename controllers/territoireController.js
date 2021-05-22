const Cas = require('../models/Cas');
const Province = require('../models/Province');
const Localite = require('../models/Localite');
const Territoire = require('../models/Territoire');
const Ville = require('../models/Ville');
const ZoneSante = require('../models/ZoneSante');
const Maladie = require('../models/Maladie');
const fs = require('fs');

exports.postTerritoire = async (req, res, next) => {
    
    const { code, nom, lat, long, ville } = req.body
    const TerritoireExist = await Territoire.findOne({ code: code, nom: nom });

    if (TerritoireExist) {
        res.status(400).json({ "error": 'Territoire already Exist' });
    } else {
        let territoire = new Territoire({
            code: code,
            nom: nom,
            lat: lat,
            long: long,
        });

        let foundVille = await Ville.find({nom: ville});
        foundVille = foundVille["0"];
        territoire.ville = foundVille;

        territoire.save().then(async (result) => {
            foundVille.cas.push(result._id);
            let villeSave = await foundVille.save();
            res.status(200).json({message: "Territoire saved and pushed", territoire: result, pushing: villeSave});
        }).catch((error) => {
            res.status(400).json({ 'error': error.message })
        });
    }
}
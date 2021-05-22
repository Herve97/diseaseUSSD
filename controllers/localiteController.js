const Cas = require('../models/Cas');
const Province = require('../models/Province');
const Localite = require('../models/Localite');
const Territoire = require('../models/Territoire');
const Ville = require('../models/Ville');
const ZoneSante = require('../models/ZoneSante');
const Maladie = require('../models/Maladie');
const fs = require('fs');

exports.postLocalite = async (req, res, next) => {


    const { code, nom, lat, long, territoire } = req.body

    const LocaliteExist = await Localite.findOne({ code: code, nom: nom });

    if (LocaliteExist) {
        res.status(400).json({ "error": 'Localite already Exist' });
    } else {
        let localite = new Localite({
            code: code,
            nom: nom,
            lat: lat,
            long: long
        });

        let foundMaladie = await Maladie.find({maladie: req.body.maladie});
        foundMaladie = foundMaladie["0"];
        localite.maladie = foundMaladie;

        let foundTerritoire = await Territoire.find({nom: territoire});
        foundTerritoire = foundTerritoire["0"];
        localite.territoire = foundTerritoire;

        localite.save().then(async (result) => {
            foundMaladie.localite.push(result._id);
            let maladieSave = await foundMaladie.save();

            foundTerritoire.localite.push(result._id);
            let territoireSave = await foundTerritoire.save();
            res.status(200).json({localite: result, message: "Localite saved"});
        }).catch((error) => {
            res.status(400).json({ 'error': error.message });
        });
    }
}
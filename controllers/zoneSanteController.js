const ZoneSante = require('../models/ZoneSante');
const Localite = require('../models/Localite');
const Province = require('../models/Province');
const Ville = require('../models/Ville');
const Territoire = require('../models/Territoire');

exports.postZoneSante = async (req, res, next) => {
    const zoneSanteExist = await ZoneSante.findOne({ code: req.body.code });
    //console.log(zoneSanteExist);
    //const { code, localite, province, ville, territoire } = req.body

    if (zoneSanteExist) {
        res.status(400).json({ "error": 'Zone de Santé already Exist' });
    } else {
        let zoneSante = new ZoneSante({
            code: req.body.code
        });

        let foundLocalite = await Localite.find({nom: req.body.localite});
        foundLocalite = foundLocalite["0"];
        zoneSante.localite = foundLocalite;

        let foundProvince = await Province.find({nom: req.body.province});
        foundProvince = foundProvince["0"];
        zoneSante.province = foundProvince;

        let foundVille = await Ville.find({nom: req.body.ville});
        foundVille = foundVille["0"];
        zoneSante.ville = foundVille;

        let foundTerritoire = await Territoire.find({nom: req.body.territoire});
        foundTerritoire = foundTerritoire["0"];
        zoneSante.territoire = foundTerritoire;   

        zoneSante.save().then(async (result) => {
            foundLocalite.zonesante.push(result._id);
            let localiteSave = await foundLocalite.save();

            foundProvince.zonesante.push(result._id);
            let provinceSave = await foundProvince.save();

            foundVille.zonesante.push(result._id);
            let villeSave = await foundVille.save();

            foundTerritoire.zonesante.push(result._id);
            let territoireSave = await foundTerritoire.save();

            res.status(200).json({
                message: "Zone de santé saved",
                zoneSante: result,
                localite: localiteSave,
                province: provinceSave,
                ville: villeSave,
                territoire: territoireSave
            });
        }).catch((error) => {
            res.status(400).json({ 'error': error });
        });
    }
}
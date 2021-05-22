const Cas = require('../models/Cas');
const Province = require('../models/Province');
const Localite = require('../models/Localite');
const Territoire = require('../models/Territoire');
const Ville = require('../models/Ville');
const ZoneSante = require('../models/ZoneSante');
const Maladie = require('../models/Maladie');


// get all maladie
exports.getMaladies = async (req, res, next) => {
    try {
        const maladie = await Maladie.find();
        if (!maladie){
            res.status(500).send(err)
            return next(new Error('Aucune maladie n\'est enregistré'));
        } else {
            res.render('index', {maladie: maladie });
        }
       
    } catch (error) {
        next(error);
    }
}

// get maladie by id
exports.getMaladie = async (req, res, next) => {
    try {
        const id = req.params.id;
        const maladie = await Maladie.findOne({_id: id});
        if (!maladie){
            res.status(500).send(err)
            return next(new Error('Cette maladie n\'existe pas'));
        } else {
            res.status(200).json({maladie: maladie });
        }
       
    } catch (error) {
        next(error)
    }
}

// Ajout maladie
exports.postMaladie = async (req, res, next) => {
    try {
        
        await Maladie.findOne({maladie: req.body.maladie}).then((maladie) =>{
            if(maladie){
                console.log(`La maladie ${maladie.maladie} existe`);
            }else{
                let newMaladie = new Maladie({
                    maladie: req.body.maladie.toUpperCase()
                });

                newMaladie.save().then((result) =>{
                    res.status(200).json({maladie: result, message: "Maladie saved"});
                }).catch((error)=>{
                    res.status(400).json({ 'error': error.message });
                });
            }

        }).catch((error)=>{
            console.log("error");
            next(error.message);
        });
       
    } catch (error) {
        next(error)
    }
}


/*
// get maladie name by district
exports.getMaladieByDistrict = async (req, res, next) => {
    try {
        const id = req.params.id;
        const maladie = await Maladie.find({maladie: req.body.maladie, district: id});
        if (!maladie){
            res.status(500).send(err)
            return next(new Error('District does not exist'));
        } else {
            res.status(200).json({maladie: maladie });
        }
       
    } catch (error) {
        next(error)
    }
}

// get maladie name by province
exports.getMaladieByProvince = async (req, res, next) => {
    try {
        const id = req.params.id;
        const maladie = await Maladie.find({maladie: req.body.maladie, province: id});
        if (!maladie){
            res.status(500).send(err)
            return next(new Error('Province does not exist'));
        } else {
            res.status(200).json({maladie: maladie });
        }
       
    } catch (error) {
        next(error)
    }
}

// get maladie by secteur
exports.getMaladieBySecteur = async (req, res, next) => {
    try {
        const id = req.params.id;
        const maladie = await Maladie.find({maladie: req.body.maladie, secteur: id});
        if (!maladie){
            res.status(500).send(err)
            return next(new Error('Secteur does not exist'));
        } else {
            res.status(200).json({maladie: maladie });
        }
       
    } catch (error) {
        next(error)
    }
}

// get maladie by territoire
exports.getMaladieByTerritoire = async (req, res, next) => {
    try {
        const id = req.params.id;
        const maladie = await Maladie.find({maladie: req.body.maladie, territoire: id});
        if (!maladie){
            res.status(500).send(err)
            return next(new Error('Territoire does not exist'));
        } else {
            res.status(200).json({maladie: maladie });
        }
       
    } catch (error) {
        next(error)
    }
}

// get maladie by localité
exports.getMaladieByLocalite = async (req, res, next) => {
    try {
        const id = req.params.id;
        const maladie = await Maladie.find({maladie: req.body.maladie, localite: id});
        if (!maladie){
            res.status(500).send(err)
            return next(new Error('Localite does not exist'));
        } else {
            res.status(200).json({maladie: maladie });
        }
       
    } catch (error) {
        next(error)
    }
}

// get maladie by ville
exports.getMaladieByVille = async (req, res, next) => {
    try {
        const id = req.params.id;
        const maladie = await Maladie.find({maladie: req.body.maladie, ville: id});
        if (!maladie){
            res.status(500).send(err)
            return next(new Error('District does not exist'));
        } else {
            res.status(200).json({maladie: maladie });
        }
       
    } catch (error) {
        next(error)
    }
}
*/

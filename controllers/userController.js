const User = require('../models/User');
const Maladie = require('../models/Maladie');
const Territoire = require('../models/Territoire');
const Localite = require('../models/Localite');
const Ville = require('../models/Ville');
const Province = require('../models/Province');
const ZoneSante = require('../models/ZoneSante');
// const Naissance = require('../models/Naissance');
const Cas = require('../models/Cas');

const bcrypt = require('bcryptjs');

const fs = require('fs');


exports.signUp = async (req, res, next) => {
  // const { phoneNumber, text } = req.body;

  let args = {
    phoneNumber: req.body.phoneNumber,
    sessionId: req.body.sessionId,
    serviceCode: req.body.serviceCode,
    text: req.body.text
  };

  console.log('####################', req.body);
  let response = "";

  const phoneNumberExist = await User.findOne({ telephone: args.phoneNumber });
  console.log("Phone number exist ", phoneNumberExist);

  if (phoneNumberExist) {

    if (args.text === '') {
      console.log("number exist test 1");
      response = `CON Choisissez une option\n1. MALADIE\n2. NAISSANCE`;
    } else if (args.text !== '') {
      let array = args.text.split('*');
      console.log(array);

      if (parseInt(array[0]) === 1) {

        response = `CON Choisissez une maladie\n1. EBOLA\n2. COVID-19\n3. TUBERCULOSE\n4. TYPHOÏDE\n5. CHOLERA`;

        if (parseInt(array[1]) === 1) {
          // SI MALADIE === EBOLA
          response = `CON Veuillez renseigner le nombre de cas confirmer`;

          if (array.length === 3) {
            
            response = `CON Veuillez renseigner le nombre de(s) gueris`;
            // response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

          } else if(array.length === 4){
            response = `CON Veuillez renseigner le nombre de(s) décès`;
          }else if (array.length === 5) {

            response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

            
          }else if(array.length === 6){

            var codeZone = array[5];

            // check zone santé
            var zoneExist = await ZoneSante.findOne({ code: codeZone });

            

              let province = await Province.find({ code: codeZone.substr(0, 2) });
              let ville = await Ville.find({ code: codeZone.substr(2, 2) });
              let territoire = await Territoire.find({ code: codeZone.substr(4, 2) });
              let localite = await Localite.find({ code: codeZone.substr(6, 2) });

            if (zoneExist) {

              let cas = new Cas({
                cas_confirmer: parseInt(array[2]),
                nombre_gueris: parseInt(array[3]),
                nombre_deces: parseInt(array[4])
              });

              province = province["0"];
              cas.province = province;

              ville = ville["0"];
              cas.ville = ville;

              territoire = territoire["0"];
              cas.territoire = territoire;

              localite = localite["0"];
              cas.localite = localite;

              let foundMaladie = await Maladie.find({nom: "EBOLA"});
              foundMaladie = foundMaladie["0"];
              cas.maladie = foundMaladie;

              let foundZone = await ZoneSante.find({code: codeZone});
              foundZone = foundZone["0"];
              cas.zonesante = foundZone;

              await cas.save().then(async (result)=>{
                foundMaladie.cas.push(result._id);
                let maladieSave = await foundMaladie.save();

                foundZone.cas.push(result._id);
                let casSave = await foundZone.save();

                localite.cas.push(result._id);
                let localiteSave = await localite.save();

                province.cas.push(result._id);
                let provinceSave = await province.save();

                ville.cas.push(result._id);
                let villeSave = await ville.save();

                territoire.cas.push(result._id);
                let territoireSave = await territoire.save();

                response = 'END Enregistrement réussi.';
              }).catch((error) => {
                res.status(400).json({ 'error': error });
              });

            } else {
              response = `END La zone de santé est incorrecte. Veuillez réessayer`;
            }

          }
          // END EBOLA
        } else if (parseInt(array[1]) === 2) {
          // SI MALADIE === COVID
          response = `CON Veuillez renseigner le nombre de cas confirmer`;

          if (array.length === 3) {
            
            response = `CON Veuillez renseigner le nombre de(s) gueris`;
            // response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

          } else if(array.length === 4){
            response = `CON Veuillez renseigner le nombre de(s) décès`;
          }else if (array.length === 5) {

            response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

            
          }else if(array.length === 6){

            var codeZone = array[5];

            // check zone santé
            var zoneExist = await ZoneSante.findOne({ code: codeZone });

            try {

              const province = await Province.findOne({ code: codeZone.substr(0, 2) });
              const ville = await Ville.findOne({ code: codeZone.substr(2, 2) });
              const district = await Territoire.findOne({ code: codeZone.substr(4, 2) });
              const localite = await Localite.findOne({ code: codeZone.substr(6, 2) });

            } catch (error) {
              console.log("Error on check code by other ", error);
            }

            if (zoneExist) {

              let cas = new Cas({
                cas_confirmer: parseInt(array[2]),
                nombre_gueris: parseInt(array[3]),
                nombre_deces: parseInt(array[4])
              });

              let foundMaladie = await Maladie.find({nom: "COVID-19"});
              foundMaladie = foundMaladie["0"];
              cas.maladie = foundMaladie;

              let foundZone = await ZoneSante.find({code: codeZone});
              foundZone = foundZone["0"];
              cas.zonesante = foundZone;

              await cas.save().then(async (result)=>{
                foundMaladie.cas.push(result._id);
                let maladieSave = await foundMaladie.save();

                foundZone.cas.push(result._id);
                let casSave = await foundZone.save();

                response = 'END Enregistrement réussi.';
              }).catch((error) => {
                res.status(400).json({ 'error': error });
              });

            } else {
              response = `END La zone de santé est incorrecte. Veuillez réessayer`;
            }

          }
          // END COVID
        } else if (parseInt(array[1]) === 3) {
          // SI MALADIE === TUBERCULOSE
          response = `CON Veuillez renseigner le nombre de cas confirmer`;

          if (array.length === 3) {
            
            response = `CON Veuillez renseigner le nombre de(s) gueris`;
            // response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

          } else if(array.length === 4){
            response = `CON Veuillez renseigner le nombre de(s) décès`;
          }else if (array.length === 5) {

            response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

            
          }else if(array.length === 6){

            var codeZone = array[5];

            // check zone santé
            var zoneExist = await ZoneSante.findOne({ code: codeZone });

            try {

              const province = await Province.findOne({ code: codeZone.substr(0, 2) });
              const ville = await Ville.findOne({ code: codeZone.substr(2, 2) });
              const district = await Territoire.findOne({ code: codeZone.substr(4, 2) });
              const localite = await Localite.findOne({ code: codeZone.substr(6, 2) });

            } catch (error) {
              console.log("Error on check code by other ", error);
            }

            if (zoneExist) {

              let cas = new Cas({
                cas_confirmer: parseInt(array[2]),
                nombre_gueris: parseInt(array[3]),
                nombre_deces: parseInt(array[4])
              });

              let foundMaladie = await Maladie.find({nom: "TUBERCULOSE"});
              foundMaladie = foundMaladie["0"];
              cas.maladie = foundMaladie;

              let foundZone = await ZoneSante.find({code: codeZone});
              foundZone = foundZone["0"];
              cas.zonesante = foundZone;

              await cas.save().then(async (result)=>{
                foundMaladie.cas.push(result._id);
                let maladieSave = await foundMaladie.save();

                foundZone.cas.push(result._id);
                let casSave = await foundZone.save();

                response = 'END Enregistrement réussi.';
              }).catch((error) => {
                res.status(400).json({ 'error': error });
              });


            } else {
              response = `END La zone de santé est incorrecte. Veuillez réessayer`;
            }

          }
          // END TUBERCULOSE
        } else if (parseInt(array[1]) === 4) {
          // SI MALADIE === TIPHOÏDE
          response = `CON Veuillez renseigner le nombre de cas confirmer`;

          if (array.length === 3) {
            
            response = `CON Veuillez renseigner le nombre de(s) gueris`;
            // response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

          } else if(array.length === 4){
            response = `CON Veuillez renseigner le nombre de(s) décès`;
          }else if (array.length === 5) {

            response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

            
          }else if(array.length === 6){

            var codeZone = array[5];

            // check zone santé
            var zoneExist = await ZoneSante.findOne({ code: codeZone });

            try {

              const province = await Province.findOne({ code: codeZone.substr(0, 2) });
              const ville = await Ville.findOne({ code: codeZone.substr(2, 2) });
              const district = await Territoire.findOne({ code: codeZone.substr(4, 2) });
              const localite = await Localite.findOne({ code: codeZone.substr(6, 2) });

            } catch (error) {
              console.log("Error on check code by other ", error);
            }

            if (zoneExist) {

              let cas = new Cas({
                cas_confirmer: parseInt(array[2]),
                nombre_gueris: parseInt(array[3]),
                nombre_deces: parseInt(array[4])
              });

              let foundMaladie = await Maladie.find({nom: "TYPHOÏDE"});
              foundMaladie = foundMaladie["0"];
              cas.maladie = foundMaladie;

              let foundZone = await ZoneSante.find({code: codeZone});
              foundZone = foundZone["0"];
              cas.zonesante = foundZone;

              await cas.save().then(async (result)=>{
                foundMaladie.cas.push(result._id);
                let maladieSave = await foundMaladie.save();

                foundZone.cas.push(result._id);
                let casSave = await foundZone.save();

                response = 'END Enregistrement réussi.';
              }).catch((error) => {
                res.status(400).json({ 'error': error });
              });

            } else {
              response = `END La zone de santé est incorrecte. Veuillez réessayer`;
            }

          }
          // END TYPHOÏDE
        } else if (parseInt(array[1]) === 5) {
          // SI MALADIE === CHOLERA
          response = `CON Veuillez renseigner le nombre de cas confirmer`;

          if (array.length === 3) {
            
            response = `CON Veuillez renseigner le nombre de(s) gueris`;
            // response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

          } else if(array.length === 4){
            response = `CON Veuillez renseigner le nombre de(s) décès`;
          }else if (array.length === 5) {

            response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

            
          }else if(array.length === 6){

            var codeZone = array[5];

            // check zone santé
            var zoneExist = await ZoneSante.findOne({ code: codeZone });

            try {

              const province = await Province.findOne({ code: codeZone.substr(0, 2) });
              const ville = await Ville.findOne({ code: codeZone.substr(2, 2) });
              const district = await Territoire.findOne({ code: codeZone.substr(4, 2) });
              const localite = await Localite.findOne({ code: codeZone.substr(6, 2) });

            } catch (error) {
              console.log("Error on check code by other ", error);
            }

            if (zoneExist) {

              let cas = new Cas({
                cas_confirmer: parseInt(array[2]),
                nombre_gueris: parseInt(array[3]),
                nombre_deces: parseInt(array[4])
              });

              let foundMaladie = await Maladie.find({nom: "CHOLERA"});
              foundMaladie = foundMaladie["0"];
              cas.maladie = foundMaladie;

              let foundZone = await ZoneSante.find({code: codeZone});
              foundZone = foundZone["0"];
              cas.zonesante = foundZone;

              await cas.save().then(async (result)=>{
                foundMaladie.cas.push(result._id);
                let maladieSave = await foundMaladie.save();

                foundZone.cas.push(result._id);
                let casSave = await foundZone.save();

                response = 'END Enregistrement réussi.';
              }).catch((error) => {
                res.status(400).json({ 'error': error });
              });


            } else {
              response = `END La zone de santé est incorrecte. Veuillez réessayer`;
            }

          }
          // END CHOLERA
        }

      } else if (parseInt(array[0]) === 2) {
        // NAISSANCE

        if (array.length === 1) {
          console.log("Naissance ", 1);
          response = `CON Veuillez renseigner le nombre(s) des naissances`;
        } else if (array.length === 2) {

          response = `CON Veuillez renseigner le nombre(s) des morts nés`;

        } else if (array.length === 3) {

          response = `CON Mettez le code de votre zone de santé pour confirmer l'enregistrement`;

        }else if(array.length === 4){

          let data = new Cas({
            naissance: array[1],
            mort_ne: array[2]
          });
          let codeZone = array[3];

          // check zone santé
          let zoneExist = await ZoneSante.findOne({ code: codeZone });

          if (zoneExist) {

            const provinces = await Province.findOne({ code: codeZone.substr(0, 2) });
            const villes = await Ville.findOne({ code: codeZone.substr(2, 2) });
            const districts = await Territoire.findOne({ code: codeZone.substr(4, 2) });
            const localites = await Localite.findOne({ code: codeZone.substr(6, 2) });

            let foundMaladie = await Maladie.find({nom: "NAISSANCE"});
            foundMaladie = foundMaladie["0"];
            data.maladie = foundMaladie;

            let foundZone = await ZoneSante.find({code: codeZone});
            foundZone = foundZone["0"];
            data.zonesante = foundZone;

            await data.save().then(async (result)=>{
              foundMaladie.cas.push(result._id);
              let maladieSave = await foundMaladie.save();

              foundZone.cas.push(result._id);
              let casSave = await foundZone.save();

              response = 'END Enregistrement réussi.';
            }).catch((error) => {
              res.status(400).json({ 'error': error });
            });

            /*
              await data.save((err) => {
                if (err) {
                  response = 'END Echec.';
                  throw err;
                }
              
              });
            */

          } else {
            response = `END La zone de santé est incorrecte. Veuillez réessayer`;
          }

        }

      } else {
        response = `END Bye`;
      }

    } else {
      response = `END Erreur réseau s'il vous plaît réessayer plus tard.`;
    }


  } else {
    response = `END Vous n'êtes pas autoriser à utiliser ce code.`
  }

  setTimeout(() => {
    console.log("##################### ", req.body);
    //res.send(response);
    res.end()
  }, 3000);


}



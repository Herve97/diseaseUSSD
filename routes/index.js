var express = require('express');
var router = express.Router();

const Cas = require('../models/Cas');
const Province = require('../models/Province');
const Localite = require('../models/Localite');
const Territoire = require('../models/Territoire');
const Ville = require('../models/Ville');
const ZoneSante = require('../models/ZoneSante');
const Naissance = require('../models/Naissance');
const Maladie = require('../models/Maladie');

const storage = require('node-persist');

const ObjectId = require('mongoose').Types.ObjectId;

var total_cas =0;
var total_gueris = 0;
var total_mort = 0;


/* GET home page. */
router.get('/home', async function(req, res, next) {


  await Maladie.aggregate(
       
    [
      {
        "$lookup":{

          "from":"cas", // name of the foreign collection
          "localField":"cas",
          "foreignField":"_id",
          "as":"case"
        }
      },

      {
        "$addFields":{

          "Confirmes":{
            "$sum":"$case.cas_confirmer"
          },
          "Gueris":{
            "$sum":"$case.nombre_gueris"
          },
          "Deces":{
            "$sum":"$case.nombre_deces",
          },
          "Naissance":{
            "$sum":"$case.naissance",
          },
          "MortNe":{
            "$sum":"$case.mort_ne"
          }
        }
      },

      {
        "$project":{
          "case":0
        }
      }
    ]
    


  ).exec(async function(err, results){
    if(err){
      throw err;
    }

    const maladie = await Maladie.find();

    var datas = JSON.stringify({results});
    data = JSON.parse(datas);
    res.render('index', {data: data, maladie: maladie});

  })
  // END Maladie Total PAYS
  /*
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
  */


});

router.get('/provinces/:maladie', async function(req, res, next) {

  

  var maladie = req.params.maladie


  const mal = await Maladie.findOne({_id: maladie});

  await Province.find().then(async (province) =>{

    province.forEach(async (prov) => {
      
      await Cas.find({_id: prov.cas}).then(async (cas) =>{

        cas.forEach((cases)=>{

          total_cas += cases.cas_confirmer;
          total_gueris += cases.nombre_gueris;
          total_mort += cases.nombre_deces;
        });

      }).catch((error)=>{
        next(error);
      });

    });

  }).catch((error)=>{
    next(error);
  });

  console.log("My somme confirmer ", total_cas);
  console.log("My somme gueris ", total_gueris);
  console.log("My somme deces ", total_mort);

  await Province.aggregate(
       //console.log("maladie", maladie),
    [

      { "$match" : { maladie : ObjectId(maladie) } },

      {
        "$lookup":{

          "from":"cas", // name of the foreign collection
          "localField":"cas",
          "foreignField":"_id",
          "as":"case"
        }
      },

      {
        "$addFields":{

          "Confirmes":{
            "$sum":"$case.cas_confirmer"
          },
          "Gueris":{
            "$sum":"$case.nombre_gueris"
          },
          "Deces":{
            "$sum":"$case.nombre_deces",
          },
          "Naissance":{
            "$sum":"$case.naissance",
          },
          "MortNe":{
            "$sum":"$case.mort_ne"
          }
        }
      },

      {
        "$addFields":{

          "somme_confirmer":{
            "$sum":"$Confirmes"
          },
          "somme_gueris":{
            "$sum":"$Gueris"
          },
          "somme_mort":{
            "$sum":"$Deces",
          }
        }
      },

      {
        "$project":{
          "case":0
        }
      }
    ]
    

  ).exec(async function(err, results){
    if(err){
      throw err;
    }

    var datas = JSON.stringify({results});
    data = JSON.parse(datas);
    console.log(data);
    res.render('province', {
      data: data,
      maladie: mal,
      total_cas: total_cas,
      total_gueris: total_gueris,
      total_mort: total_mort
    });

  })


  

  //res.render('province');
});

router.get('/ville', async function(req, res, next) {
  res.render('ville');
});

module.exports = router;

/*

   <% province.forEach(function(prov) { %> <% }); %>
   <%= prov.nom %>

*/

/*

var provGlobal = [];
var zoneGlobal = [];
var casGlobal = [];

var total_cas_global = [];
var total_gueris_global = [];
var total_mort_global = [];
var maladie = [];

*/



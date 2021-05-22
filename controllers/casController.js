const Cas = require('../models/Cas');
const Province = require('../models/Province');
const Localite = require('../models/Localite');
const Territoire = require('../models/Territoire');
const Ville = require('../models/Ville');
const ZoneSante = require('../models/ZoneSante');
const Maladie = require('../models/Maladie');
const fs = require('fs');

// const ebola_ville = './config/ebola_ville.json';

exports.postCas = async (req, res, next) => {

  let cas = new Cas({
    cas_confirmer: req.body.cas_confirmer,
    nombre_gueris: req.body.nombre_gueris,
    nombre_deces: req.body.nombre_deces,
    naissance: req.body.naissance,
    mort_ne: req.body.mort_ne
  });

  let foundMaladie = await Maladie.find({maladie: req.body.maladie});
  foundMaladie = foundMaladie["0"];
  cas.maladie = foundMaladie;

  let foundZone = await ZoneSante.find({code: req.body.zonesante});
  foundZone = foundZone["0"];
  cas.zonesante = foundZone;

  let foundLocalite = await Localite.find({nom: req.body.localite});
  foundLocalite = foundLocalite["0"];
  cas.localite = foundLocalite;

  let foundProvince = await Province.find({nom: req.body.province});
  foundProvince = foundProvince["0"];
  cas.province = foundProvince;

  let foundVille = await Ville.find({nom: req.body.ville});
  foundVille = foundVille["0"];
  cas.ville = foundVille;

  let foundTerritoire = await Territoire.find({nom: req.body.territoire});
  foundTerritoire = foundTerritoire["0"];
  cas.territoire = foundTerritoire;

  cas.save().then(async (result) => {
    foundMaladie.cas.push(result._id);
    let maladieSave = await foundMaladie.save();

    foundZone.cas.push(result._id);
    let zoneSave = await foundZone.save();

    foundLocalite.cas.push(result._id);
    let localiteSave = await foundLocalite.save();

    foundProvince.cas.push(result._id);
    let provinceSave = await foundProvince.save();

    foundVille.cas.push(result._id);
    let villeSave = await foundVille.save();

    foundTerritoire.cas.push(result._id);
    let territoireSave = await foundTerritoire.save();

    res.status(200).json({
      message: "Données enregistré!...",
      cas: result,
      maladie: maladieSave,
      zonesante: zoneSave
    });

  }).catch((error) => {
    res.status(400).json({ 'error': error });
  });


}

/*
 
 Somme des cas par localité 

*/

// Maladie par localité
exports.getLocMaladie = async (req, res, next) => {

  var total_mort = 0;
  var total_gueris = 0;
  var total_cas = 0;

  let localiteParams = req.params.localite;
  let maladieParams = req.params.maladie;

  console.log("Mes paramètres ", req.params);

  let checkMaladie = await Maladie.findOne({ maladie: maladieParams });

  if (checkMaladie) {

    let checkLoc = await Localite.findOne({ nom: localiteParams });

    if (checkLoc) {

      await Cas.find({ maladie: checkMaladie._id }).then(async (result) => {

        let oldtotal_mort = total_mort;
        let oldtotal_gueris = total_gueris;
        let oldtotal_cas = total_cas;

        result.forEach((value) => {
          total_mort += value.nombre_deces;
          total_gueris += value.nombre_gueris;
          total_cas += value.cas_confirmer;
        });

        console.log("Ancienne somme des cas confirmer ", total_cas);
        console.log("Ancienne somme des cas guéris ", total_gueris);
        console.log("Ancienne somme des cas de décès ", total_mort);

        var checkNewCas = await Cas.countDocuments();

        if (checkNewCas < (checkNewCas + 1)) {

          total_cas = 0;
          total_mort = 0;
          total_gueris = 0;

          result.forEach((value) => {
            total_mort += value.nombre_deces;
            total_gueris += value.nombre_gueris;
            total_cas += value.cas_confirmer;
          });

          total_cas = (total_mort + total_gueris) - total_cas;

          console.log("La somme des cas confirmer pour la localité ", total);
          console.log("La somme des cas guéris pour la localité ", total_gueris);
          console.log("La somme des cas de décès pour la localité ", total_mort);

        } else {
          total_cas = oldtotal_cas;
          total_mort = oldtotal_mort;
          total_gueris = oldtotal_gueris;
          total = (total_mort + total_gueris) - total_cas;
        }

        res.status(200).send({
          result: result,
          cas_confirmer: total,
          cas_gueris: total_gueris,
          cas_mort: total_mort
        });

      }).catch((error) => {
        res.json({ erreur: next(error) });
      });

    } else {
      res.status(400).send({ message: "La localité est inexistante" });
    }

  } else {
    res.status(400).send({ message: "La maladie sélectionnée est inexistante" });
  }


}

// Maladie par territoire
exports.getTerritoireMaladie = async (req, res, next) => {

  var total_mort = 0;
  var total_gueris = 0;
  var total_cas = 0;

  let territoireParams = req.params.territoire;
  let maladieParams = req.params.maladie;

  const checkMaladie = await Maladie.findOne({ maladie: maladieParams });

  await Territoire.findOne({ nom: territoireParams }).then(async (territoire) => {

    // localite
    await Localite.find({ territoire: territoire._id }).then(async (localite) => {

      localite.forEach(async (valLocalite) => {

        // zone de sante
        await ZoneSante.find({ localite: valLocalite._id }).then((zonesante) => {

          try {

            zonesante.forEach(async (zone_sante) => {

              await Cas.find({ zonesante: zone_sante._id, maladie: checkMaladie._id }).then(async (result) => {

                result.forEach((value) => {
                  total_cas += value.cas_confirmer;
                  total_gueris += value.nombre_gueris;
                  total_mort += value.nombre_deces;
                });

                total_cas = (total_mort + total_gueris) - total_cas;

                console.log("La somme des cas confirmer pour la localité ", total);
                console.log("La somme des cas guéris pour la localité ", total_gueris);
                console.log("La somme des cas de décès pour la localité ", total_mort);

                res.status(200).send({
                  cas_confirmer: total,
                  cas_gueris: total_gueris,
                  cas_mort: total_mort
                });

              }).catch((error) => {
                ext(error);
              });

            });

          } catch (error) {
            res.status(500).send({ message: "Erreur de district maladie", error: error });
          }

        }).catch((error) => {
          next(error);
        });
        // end zone de sante

      });


    }).catch((error) => {
      next(error);
    });
    // end localite


  }).catch((error) => {
    next(error);
  });

}

// Maladie par ville
exports.getVilleMaladie = async (req, res, next) => {

  var total_mort = 0;
  var total_gueris = 0;
  var total_cas = 0;

  let villeParams = req.params.ville;
  let maladieParams = req.params.maladie;

  const checkMaladie = await Maladie.findOne({ maladie: maladieParams });

  await Ville.findOne({ nom: villeParams }).then(async (ville) => {
    // TERRITOIRE
    await Territoire.find({ville: ville._id}).then(async (territoire) => {

      territoire.forEach(async (valTerritoire) =>{

        // localite
        await Localite.find({ territoire: valTerritoire._id }).then(async (localite) => {

          localite.forEach(async (valLocalite) => {

            // zone de sante
            await ZoneSante.find({ localite: valLocalite._id }).then((zonesante) => {

              try {

                zonesante.forEach(async (zone_sante) => {

                  await Cas.find({ zonesante: zone_sante._id, maladie: checkMaladie._id }).then(async (result) => {

                    result.forEach((value) => {
                      total_cas += value.cas_confirmer;
                      total_gueris += value.nombre_gueris;
                      total_mort += value.nombre_deces;
                    });

                    total_cas = (total_mort + total_gueris) - total_cas;

                    console.log("La somme des cas confirmer pour la localité ", total);
                    console.log("La somme des cas guéris pour la localité ", total_gueris);
                    console.log("La somme des cas de décès pour la localité ", total_mort);

                    res.status(200).send({
                      cas_confirmer: total,
                      cas_gueris: total_gueris,
                      cas_mort: total_mort
                    });

                  }).catch((error) => {
                    next(error);
                  });
                  // END CAS

                });

              } catch (error) {
                res.status(500).send({ message: "Erreur de district maladie", error: error });
              }

            }).catch((error) => {
              next(error);
            });
            // end zone de sante

          });

        }).catch((error) => {
          next(error);
        });
        // end localite
      });

    });
    //END TERRITOIRE

  }).catch((error) => {
    next(error);
  });
  // END VILLE

}

// somme des provinces

exports.getProvince = async (req, res, next) => {

  var total_mort = 0;
  var total_gueris = 0;
  var total_cas = 0;

  var provinceParams = req.params.province;
  var maladieParams = req.params.maladie;

  const checkMaladie = await Maladie.findOne({ maladie: maladieParams });

  console.log("Maladie ", checkMaladie);

  await Province.findOne({nom: provinceParams}).then(async (province)=>{
    console.log("Province ", province);
    // ville
    await Ville.find({province: province._id}).then(async (ville)=>{
      console.log("Villes ", ville);
      ville.forEach(async (valVille)=>{
        //  territoire
        await Territoire.find({ ville: valVille._id }).then(async (territoire) => {
          console.log("Térritoires ", territoire);
          territoire.forEach(async (valTerritoire)=>{

            // localite
            await Localite.find({ territoire: valTerritoire._id }).then(async (localite) => {
               console.log("Localités ", localite);
              localite.forEach(async (valLocalite) => {

                // zone de sante
                await ZoneSante.find({ localite: valLocalite._id }).then((zonesante) => {
                  console.log("Zone de santé ", zonesante);
                  try {

                    zonesante.forEach(async (zone_sante) => {

                      await Cas.find({ zonesante: zone_sante._id, maladie: checkMaladie._id }).then(async (result) => {

                        result.forEach((value) => {
                          total_cas += value.cas_confirmer;
                          total_gueris += value.nombre_gueris;
                          total_mort += value.nombre_deces;
                        });

                        total_cas = total_cas - (total_mort + total_gueris);

                        console.log("La somme des cas confirmer pour la localité ", total_cas);
                        console.log("La somme des cas guéris pour la localité ", total_gueris);
                        console.log("La somme des cas de décès pour la localité ", total_mort);

                        res.status(200).send({
                          cas_confirmer: total_cas,
                          cas_gueris: total_gueris,
                          cas_mort: total_mort
                        });

                      }).catch((error) => {
                        next(error);
                      });

                    });

                  } catch (error) {
                    res.status(500).send({ message: "Erreur de district maladie", error: error });
                  }

                }).catch((error) => {
                  next(error);
                });
                // end zone de sante

              });


            }).catch((error) => {
              next(error);
            });
            // end localite


          });

        }).catch((error) => {
          next(error);
        });
        // END TERRIROIRE

      }); 

    }).catch((error)=>{
      next(error);
    });
    //END VILLE

  }).catch((error)=>{
    next(error);
  });
  // END PROVINCE
  

}


// Maladie par province with GeoJson
exports.getProvinceMaladie = async (req, res, next) => {

  var provinceParams = req.params.province;
  var maladieParams = req.params.maladie;

  let total_cas_pays = 0;
  let total_gueris_pays = 0;
  let total_mort_pays = 0;

  let total_mort = 0;
  let total_gueris = 0;
  let total_cas = 0;

  // var total = 0;

  //const checkMaladie = await Maladie.findOne({maladie: maladieParams});
  var checkMaladie = await Maladie.findOne({ maladie: maladieParams });

  await Cas.find({ maladie: checkMaladie._id }).then(async (cas) => {

    cas.forEach((casValue) => {
      total_cas_pays += casValue.cas_confirmer;
      total_gueris_pays += casValue.nombre_gueris;
      total_mort_pays += casValue.nombre_deces;
    });

    total_cas_pays = (total_gueris_pays + total_mort_pays) - total_cas_pays;

  }).catch((error) => {
    console.log("Erreur somme pays");
    next(error);
  });


  await Province.findOne({ nom: provinceParams }).then(async (province) => {

    // ville
    await Ville.find({ province: province._id }).then(async (ville) => {

      ville.forEach(async (valVille) => {

        // territoire
        await Territoire.find({ territoire: valVille._id }).then(async (territoire) => {

          territoire.forEach(async (valTerritoire) => {

            // localite
            await Localite.find({ territoire: valTerritoire._id }).then(async (localite) => {

              localite.forEach(async (valLocalite) => {

                // zone de sante
                await ZoneSante.find({ localite: valLocalite._id }).then(async (zonesante) => {
                  var value = {};
                  try {

                    zonesante.forEach(async (zone_sante) => {

                      await Cas.find({ zonesante: zone_sante._id, maladie: checkMaladie._id }).then(async (result) => {

                        result.forEach((value) => {
                          total_cas += value.cas_confirmer;
                          total_gueris += value.nombre_gueris;
                          total_mort += value.nombre_deces;
                        });

                        total_cas = (total_mort + total_gueris) - total_cas;

                        console.log("Total cas ", total_cas);

                        value = result;

                        // check if ebola
                        if (checkMaladie.maladie === "EBOLA") {

                          jsonReader('./config/ebola.json', (err, data) => {
                            if (err) {
                              console.log("Erreur 1 ", err.message);
                            } else {

                              console.log("My features ", data.features[0].properties);

                              // BAS-UELE
                              if (provinceParams.toUpperCase() === "BAS-UELE") {

                                data.features[0].cases = total_cas_pays;
                                data.features[0].totalRecovered = total_gueris_pays;
                                data.features[0].totalDeath = total_mort_pays;
                                data.features[0].properties.liveCases = total_cas;
                                data.features[0].properties.recovered = total_gueris;
                                data.features[0].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "EQUATEUR") {

                                data.features[1].cases = total_cas_pays;
                                data.features[1].totalRecovered = total_gueris_pays;
                                data.features[1].totalDeath = total_mort_pays;
                                data.features[1].properties.liveCases = total_cas;
                                data.features[1].properties.recovered = total_gueris;
                                data.features[1].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-KATANGA") {

                                data.features[2].cases = total_cas_pays;
                                data.features[2].totalRecovered = total_gueris_pays;
                                data.features[2].totalDeath = total_mort_pays;
                                data.features[2].properties.liveCases = total_cas;
                                data.features[2].properties.recovered = total_gueris;
                                data.features[2].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-LOMAMI") {
                                data.features[3].cases = total_cas_pays;
                                data.features[3].totalRecovered = total_gueris_pays;
                                data.features[3].totalDeath = total_mort_pays;
                                data.features[3].properties.liveCases = total_cas;
                                data.features[3].properties.recovered = total_gueris;
                                data.features[3].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-UELE") {

                                data.features[4].cases = total_cas_pays;
                                data.features[4].totalRecovered = total_gueris_pays;
                                data.features[4].totalDeath = total_mort_pays;
                                data.features[4].properties.liveCases = total_cas;
                                data.features[4].properties.recovered = total_gueris;
                                data.features[4].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "ITURI") {

                                data.features[5].cases = total_cas_pays;
                                data.features[5].totalRecovered = total_gueris_pays;
                                data.features[5].totalDeath = total_mort_pays;
                                data.features[5].properties.liveCases = total_cas;
                                data.features[5].properties.recovered = total_gueris;
                                data.features[5].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI") {

                                data.features[6].cases = total_cas_pays;
                                data.features[6].totalRecovered = total_gueris_pays;
                                data.features[6].totalDeath = total_mort_pays;
                                data.features[6].properties.liveCases = total_cas;
                                data.features[6].properties.recovered = total_gueris;
                                data.features[6].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI CENTRAL") {

                                data.features[7].cases = total_cas_pays;
                                data.features[7].totalRecovered = total_gueris_pays;
                                data.features[7].totalDeath = total_mort_pays;
                                data.features[7].properties.liveCases = total_cas;
                                data.features[7].properties.recovered = total_gueris;
                                data.features[7].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI ORIENTAL") {

                                data.features[8].cases = total_cas_pays;
                                data.features[8].totalRecovered = total_gueris_pays;
                                data.features[8].totalDeath = total_mort_pays;
                                data.features[8].properties.liveCases = total_cas;
                                data.features[8].properties.recovered = total_gueris;
                                data.features[8].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams === "KINSHASA") {

                                data.features[9].cases = total_cas_pays;
                                data.features[9].totalRecovered = total_gueris_pays;
                                data.features[9].totalDeath = total_mort_pays;
                                data.features[9].properties.liveCases = total_cas;
                                data.features[9].properties.recovered = total_gueris;
                                data.features[9].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KONGO-CENTRAL") {

                                data.features[10].cases = total_cas_pays;
                                data.features[10].totalRecovered = total_gueris_pays;
                                data.features[10].totalDeath = total_mort_pays;
                                data.features[10].properties.liveCases = total_cas;
                                data.features[10].properties.recovered = total_gueris;
                                data.features[10].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWANGO") {

                                data.features[11].cases = total_cas_pays;
                                data.features[11].totalRecovered = total_gueris_pays;
                                data.features[11].totalDeath = total_mort_pays;
                                data.features[11].properties.liveCases = total_cas;
                                data.features[11].properties.recovered = total_gueris;
                                data.features[11].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWILU") {

                                data.features[12].cases = total_cas_pays;
                                data.features[12].totalRecovered = total_gueris_pays;
                                data.features[12].totalDeath = total_mort_pays;
                                data.features[12].properties.liveCases = total_cas;
                                data.features[12].properties.recovered = total_gueris;
                                data.features[12].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LOMAMI") {

                                data.features[13].cases = total_cas_pays;
                                data.features[13].totalRecovered = total_gueris_pays;
                                data.features[13].totalDeath = total_mort_pays;
                                data.features[13].properties.liveCases = total_cas;
                                data.features[13].properties.recovered = total_gueris;
                                data.features[13].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LUALABA") {

                                data.features[14].cases = total_cas_pays;
                                data.features[14].totalRecovered = total_gueris_pays;
                                data.features[14].totalDeath = total_mort_pays;
                                data.features[14].properties.liveCases = total_cas;
                                data.features[14].properties.recovered = total_gueris;
                                data.features[14].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MAI-NDOMBE") {

                                data.features[15].cases = total_cas_pays;
                                data.features[15].totalRecovered = total_gueris_pays;
                                data.features[15].totalDeath = total_mort_pays;
                                data.features[15].properties.liveCases = total_cas;
                                data.features[15].properties.recovered = total_gueris;
                                data.features[15].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MANIEMA") {

                                data.features[16].cases = total_cas_pays;
                                data.features[16].totalRecovered = total_gueris_pays;
                                data.features[16].totalDeath = total_mort_pays;
                                data.features[16].properties.liveCases = total_cas;
                                data.features[16].properties.recovered = total_gueris;
                                data.features[16].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MONGALA") {

                                data.features[17].cases = total_cas_pays;
                                data.features[17].totalRecovered = total_gueris_pays;
                                data.features[17].totalDeath = total_mort_pays;
                                data.features[17].properties.liveCases = total_cas;
                                data.features[17].properties.recovered = total_gueris;
                                data.features[17].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-KIVU") {

                                data.features[18].cases = total_cas_pays;
                                data.features[18].totalRecovered = total_gueris_pays;
                                data.features[18].totalDeath = total_mort_pays;
                                data.features[18].properties.liveCases = total_cas;
                                data.features[18].properties.recovered = total_gueris;
                                data.features[18].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-UBANGI") {

                                data.features[19].cases = total_cas_pays;
                                data.features[19].totalRecovered = total_gueris_pays;
                                data.features[19].totalDeath = total_mort_pays;
                                data.features[19].properties.liveCases = total_cas;
                                data.features[19].properties.recovered = total_gueris;
                                data.features[19].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SANKURU") {

                                data.features[20].cases = total_cas_pays;
                                data.features[20].totalRecovered = total_gueris_pays;
                                data.features[20].totalDeath = total_mort_pays;
                                data.features[20].properties.liveCases = total_cas;
                                data.features[20].properties.recovered = total_gueris;
                                data.features[20].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-KIVU") {

                                data.features[21].cases = total_cas_pays;
                                data.features[21].totalRecovered = total_gueris_pays;
                                data.features[21].totalDeath = total_mort_pays;
                                data.features[21].properties.liveCases = total_cas;
                                data.features[21].properties.recovered = total_gueris;
                                data.features[21].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-UBANGI") {

                                data.features[22].cases = total_cas_pays;
                                data.features[22].totalRecovered = total_gueris_pays;
                                data.features[22].totalDeath = total_mort_pays;
                                data.features[22].properties.liveCases = total_cas;
                                data.features[22].properties.recovered = total_gueris;
                                data.features[22].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TANGANYIKA") {

                                data.features[23].cases = total_cas_pays;
                                data.features[23].totalRecovered = total_gueris_pays;
                                data.features[23].totalDeath = total_mort_pays;
                                data.features[23].properties.liveCases = total_cas;
                                data.features[23].properties.recovered = total_gueris;
                                data.features[23].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHOPO") {

                                data.features[24].cases = total_cas_pays;
                                data.features[24].totalRecovered = total_gueris_pays;
                                data.features[24].totalDeath = total_mort_pays;
                                data.features[24].properties.liveCases = total_cas;
                                data.features[24].properties.recovered = total_gueris;
                                data.features[24].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHUAPA") {

                                data.features[25].cases = total_cas_pays;
                                data.features[25].totalRecovered = total_gueris_pays;
                                data.features[25].totalDeath = total_mort_pays;
                                data.features[25].properties.liveCases = total_cas;
                                data.features[25].properties.recovered = total_gueris;
                                data.features[25].properties.death = total_mort;

                                fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              }



                            }

                            console.log("My EBOLA data ", data);

                          });

                        } else if (checkMaladie.maladie === "TUBERCULOSE") {

                          jsonReader('./config/tuberculose.json', (err, data) => {
                            if (err) {
                              console.log("Erreur 1 ", err.message);
                            } else {

                              // BAS-UELE
                              if (provinceParams.toUpperCase() === "BAS-UELE") {

                                data.features[0].cases = total_cas_pays;
                                data.features[0].totalRecovered = total_gueris_pays;
                                data.features[0].totalDeath = total_mort_pays;
                                data.features[0].properties.liveCases = total_cas;
                                data.features[0].properties.recovered = total_gueris;
                                data.features[0].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "EQUATEUR") {

                                data.features[1].cases = total_cas_pays;
                                data.features[1].totalRecovered = total_gueris_pays;
                                data.features[1].totalDeath = total_mort_pays;
                                data.features[1].properties.liveCases = total_cas;
                                data.features[1].properties.recovered = total_gueris;
                                data.features[1].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-KATANGA") {

                                data.features[2].cases = total_cas_pays;
                                data.features[2].totalRecovered = total_gueris_pays;
                                data.features[2].totalDeath = total_mort_pays;
                                data.features[2].properties.liveCases = total_cas;
                                data.features[2].properties.recovered = total_gueris;
                                data.features[2].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-LOMAMI") {
                                data.features[3].cases = total_cas_pays;
                                data.features[3].totalRecovered = total_gueris_pays;
                                data.features[3].totalDeath = total_mort_pays;
                                data.features[3].properties.liveCases = total_cas;
                                data.features[3].properties.recovered = total_gueris;
                                data.features[3].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-UELE") {

                                data.features[4].cases = total_cas_pays;
                                data.features[4].totalRecovered = total_gueris_pays;
                                data.features[4].totalDeath = total_mort_pays;
                                data.features[4].properties.liveCases = total_cas;
                                data.features[4].properties.recovered = total_gueris;
                                data.features[4].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "ITURI") {

                                data.features[5].cases = total_cas_pays;
                                data.features[5].totalRecovered = total_gueris_pays;
                                data.features[5].totalDeath = total_mort_pays;
                                data.features[5].properties.liveCases = total_cas;
                                data.features[5].properties.recovered = total_gueris;
                                data.features[5].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI") {

                                data.features[6].cases = total_cas_pays;
                                data.features[6].totalRecovered = total_gueris_pays;
                                data.features[6].totalDeath = total_mort_pays;
                                data.features[6].properties.liveCases = total_cas;
                                data.features[6].properties.recovered = total_gueris;
                                data.features[6].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI CENTRAL") {

                                data.features[7].cases = total_cas_pays;
                                data.features[7].totalRecovered = total_gueris_pays;
                                data.features[7].totalDeath = total_mort_pays;
                                data.features[7].properties.liveCases = total_cas;
                                data.features[7].properties.recovered = total_gueris;
                                data.features[7].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI ORIENTAL") {

                                data.features[8].cases = total_cas_pays;
                                data.features[8].totalRecovered = total_gueris_pays;
                                data.features[8].totalDeath = total_mort_pays;
                                data.features[8].properties.liveCases = total_cas;
                                data.features[8].properties.recovered = total_gueris;
                                data.features[8].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KINSHASA") {

                                data.features[9].cases = total_cas_pays;
                                data.features[9].totalRecovered = total_gueris_pays;
                                data.features[9].totalDeath = total_mort_pays;
                                data.features[9].properties.liveCases = total_cas;
                                data.features[9].properties.recovered = total_gueris;
                                data.features[9].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KONGO-CENTRAL") {

                                data.features[10].cases = total_cas_pays;
                                data.features[10].totalRecovered = total_gueris_pays;
                                data.features[10].totalDeath = total_mort_pays;
                                data.features[10].properties.liveCases = total_cas;
                                data.features[10].properties.recovered = total_gueris;
                                data.features[10].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWANGO") {

                                data.features[11].cases = total_cas_pays;
                                data.features[11].totalRecovered = total_gueris_pays;
                                data.features[11].totalDeath = total_mort_pays;
                                data.features[11].properties.liveCases = total_cas;
                                data.features[11].properties.recovered = total_gueris;
                                data.features[11].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWILU") {

                                data.features[12].cases = total_cas_pays;
                                data.features[12].totalRecovered = total_gueris_pays;
                                data.features[12].totalDeath = total_mort_pays;
                                data.features[12].properties.liveCases = total_cas;
                                data.features[12].properties.recovered = total_gueris;
                                data.features[12].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LOMAMI") {

                                data.features[13].cases = total_cas_pays;
                                data.features[13].totalRecovered = total_gueris_pays;
                                data.features[13].totalDeath = total_mort_pays;
                                data.features[13].properties.liveCases = total_cas;
                                data.features[13].properties.recovered = total_gueris;
                                data.features[13].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LUALABA") {

                                data.features[14].cases = total_cas_pays;
                                data.features[14].totalRecovered = total_gueris_pays;
                                data.features[14].totalDeath = total_mort_pays;
                                data.features[14].properties.liveCases = total_cas;
                                data.features[14].properties.recovered = total_gueris;
                                data.features[14].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MAI-NDOMBE") {

                                data.features[15].cases = total_cas_pays;
                                data.features[15].totalRecovered = total_gueris_pays;
                                data.features[15].totalDeath = total_mort_pays;
                                data.features[15].properties.liveCases = total_cas;
                                data.features[15].properties.recovered = total_gueris;
                                data.features[15].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MANIEMA") {

                                data.features[16].cases = total_cas_pays;
                                data.features[16].totalRecovered = total_gueris_pays;
                                data.features[16].totalDeath = total_mort_pays;
                                data.features[16].properties.liveCases = total_cas;
                                data.features[16].properties.recovered = total_gueris;
                                data.features[16].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MONGALA") {

                                data.features[17].cases = total_cas_pays;
                                data.features[17].totalRecovered = total_gueris_pays;
                                data.features[17].totalDeath = total_mort_pays;
                                data.features[17].properties.liveCases = total_cas;
                                data.features[17].properties.recovered = total_gueris;
                                data.features[17].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-KIVU") {

                                data.features[18].cases = total_cas_pays;
                                data.features[18].totalRecovered = total_gueris_pays;
                                data.features[18].totalDeath = total_mort_pays;
                                data.features[18].properties.liveCases = total_cas;
                                data.features[18].properties.recovered = total_gueris;
                                data.features[18].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-UBANGI") {

                                data.features[19].cases = total_cas_pays;
                                data.features[19].totalRecovered = total_gueris_pays;
                                data.features[19].totalDeath = total_mort_pays;
                                data.features[19].properties.liveCases = total_cas;
                                data.features[19].properties.recovered = total_gueris;
                                data.features[19].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SANKURU") {

                                data.features[20].cases = total_cas_pays;
                                data.features[20].totalRecovered = total_gueris_pays;
                                data.features[20].totalDeath = total_mort_pays;
                                data.features[20].properties.liveCases = total_cas;
                                data.features[20].properties.recovered = total_gueris;
                                data.features[20].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-KIVU") {

                                data.features[21].cases = total_cas_pays;
                                data.features[21].totalRecovered = total_gueris_pays;
                                data.features[21].totalDeath = total_mort_pays;
                                data.features[21].properties.liveCases = total_cas;
                                data.features[21].properties.recovered = total_gueris;
                                data.features[21].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-UBANGI") {

                                data.features[22].cases = total_cas_pays;
                                data.features[22].totalRecovered = total_gueris_pays;
                                data.features[22].totalDeath = total_mort_pays;
                                data.features[22].properties.liveCases = total_cas;
                                data.features[22].properties.recovered = total_gueris;
                                data.features[22].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TANGANYIKA") {

                                data.features[23].cases = total_cas_pays;
                                data.features[23].totalRecovered = total_gueris_pays;
                                data.features[23].totalDeath = total_mort_pays;
                                data.features[23].properties.liveCases = total_cas;
                                data.features[23].properties.recovered = total_gueris;
                                data.features[23].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHOPO") {

                                data.features[24].cases = total_cas_pays;
                                data.features[24].totalRecovered = total_gueris_pays;
                                data.features[24].totalDeath = total_mort_pays;
                                data.features[24].properties.liveCases = total_cas;
                                data.features[24].properties.recovered = total_gueris;
                                data.features[24].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHUAPA") {

                                data.features[25].cases = total_cas_pays;
                                data.features[25].totalRecovered = total_gueris_pays;
                                data.features[25].totalDeath = total_mort_pays;
                                data.features[25].properties.liveCases = total_cas;
                                data.features[25].properties.recovered = total_gueris;
                                data.features[25].properties.death = total_mort;

                                fs.writeFile('./config/tuberculose.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              }



                            }

                            console.log("My TUBERCULOSE data ", data);

                          });

                        } else if (checkMaladie.maladie === "CHOLERA") {

                          jsonReader('./config/cholera.json', (err, data) => {
                            if (err) {
                              console.log("Erreur 1 ", err.message);
                            } else {

                              // BAS-UELE
                              if (provinceParams.toUpperCase() === "BAS-UELE") {

                                data.features[0].cases = total_cas_pays;
                                data.features[0].totalRecovered = total_gueris_pays;
                                data.features[0].totalDeath = total_mort_pays;
                                data.features[0].properties.liveCases = total_cas;
                                data.features[0].properties.recovered = total_gueris;
                                data.features[0].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "EQUATEUR") {

                                data.features[1].cases = total_cas_pays;
                                data.features[1].totalRecovered = total_gueris_pays;
                                data.features[1].totalDeath = total_mort_pays;
                                data.features[1].properties.liveCases = total_cas;
                                data.features[1].properties.recovered = total_gueris;
                                data.features[1].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-KATANGA") {

                                data.features[2].cases = total_cas_pays;
                                data.features[2].totalRecovered = total_gueris_pays;
                                data.features[2].totalDeath = total_mort_pays;
                                data.features[2].properties.liveCases = total_cas;
                                data.features[2].properties.recovered = total_gueris;
                                data.features[2].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-LOMAMI") {
                                data.features[3].cases = total_cas_pays;
                                data.features[3].totalRecovered = total_gueris_pays;
                                data.features[3].totalDeath = total_mort_pays;
                                data.features[3].properties.liveCases = total_cas;
                                data.features[3].properties.recovered = total_gueris;
                                data.features[3].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-UELE") {

                                data.features[4].cases = total_cas_pays;
                                data.features[4].totalRecovered = total_gueris_pays;
                                data.features[4].totalDeath = total_mort_pays;
                                data.features[4].properties.liveCases = total_cas;
                                data.features[4].properties.recovered = total_gueris;
                                data.features[4].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "ITURI") {

                                data.features[5].cases = total_cas_pays;
                                data.features[5].totalRecovered = total_gueris_pays;
                                data.features[5].totalDeath = total_mort_pays;
                                data.features[5].properties.liveCases = total_cas;
                                data.features[5].properties.recovered = total_gueris;
                                data.features[5].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI") {

                                data.features[6].cases = total_cas_pays;
                                data.features[6].totalRecovered = total_gueris_pays;
                                data.features[6].totalDeath = total_mort_pays;
                                data.features[6].properties.liveCases = total_cas;
                                data.features[6].properties.recovered = total_gueris;
                                data.features[6].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI CENTRAL") {

                                data.features[7].cases = total_cas_pays;
                                data.features[7].totalRecovered = total_gueris_pays;
                                data.features[7].totalDeath = total_mort_pays;
                                data.features[7].properties.liveCases = total_cas;
                                data.features[7].properties.recovered = total_gueris;
                                data.features[7].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI ORIENTAL") {

                                data.features[8].cases = total_cas_pays;
                                data.features[8].totalRecovered = total_gueris_pays;
                                data.features[8].totalDeath = total_mort_pays;
                                data.features[8].properties.liveCases = total_cas;
                                data.features[8].properties.recovered = total_gueris;
                                data.features[8].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KINSHASA") {

                                data.features[9].cases = total_cas_pays;
                                data.features[9].totalRecovered = total_gueris_pays;
                                data.features[9].totalDeath = total_mort_pays;
                                data.features[9].properties.liveCases = total_cas;
                                data.features[9].properties.recovered = total_gueris;
                                data.features[9].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KONGO-CENTRAL") {

                                data.features[10].cases = total_cas_pays;
                                data.features[10].totalRecovered = total_gueris_pays;
                                data.features[10].totalDeath = total_mort_pays;
                                data.features[10].properties.liveCases = total_cas;
                                data.features[10].properties.recovered = total_gueris;
                                data.features[10].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWANGO") {

                                data.features[11].cases = total_cas_pays;
                                data.features[11].totalRecovered = total_gueris_pays;
                                data.features[11].totalDeath = total_mort_pays;
                                data.features[11].properties.liveCases = total_cas;
                                data.features[11].properties.recovered = total_gueris;
                                data.features[11].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWILU") {

                                data.features[12].cases = total_cas_pays;
                                data.features[12].totalRecovered = total_gueris_pays;
                                data.features[12].totalDeath = total_mort_pays;
                                data.features[12].properties.liveCases = total_cas;
                                data.features[12].properties.recovered = total_gueris;
                                data.features[12].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LOMAMI") {

                                data.features[13].cases = total_cas_pays;
                                data.features[13].totalRecovered = total_gueris_pays;
                                data.features[13].totalDeath = total_mort_pays;
                                data.features[13].properties.liveCases = total_cas;
                                data.features[13].properties.recovered = total_gueris;
                                data.features[13].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LUALABA") {

                                data.features[14].cases = total_cas_pays;
                                data.features[14].totalRecovered = total_gueris_pays;
                                data.features[14].totalDeath = total_mort_pays;
                                data.features[14].properties.liveCases = total_cas;
                                data.features[14].properties.recovered = total_gueris;
                                data.features[14].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MAI-NDOMBE") {

                                data.features[15].cases = total_cas_pays;
                                data.features[15].totalRecovered = total_gueris_pays;
                                data.features[15].totalDeath = total_mort_pays;
                                data.features[15].properties.liveCases = total_cas;
                                data.features[15].properties.recovered = total_gueris;
                                data.features[15].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MANIEMA") {

                                data.features[16].cases = total_cas_pays;
                                data.features[16].totalRecovered = total_gueris_pays;
                                data.features[16].totalDeath = total_mort_pays;
                                data.features[16].properties.liveCases = total_cas;
                                data.features[16].properties.recovered = total_gueris;
                                data.features[16].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MONGALA") {

                                data.features[17].cases = total_cas_pays;
                                data.features[17].totalRecovered = total_gueris_pays;
                                data.features[17].totalDeath = total_mort_pays;
                                data.features[17].properties.liveCases = total_cas;
                                data.features[17].properties.recovered = total_gueris;
                                data.features[17].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-KIVU") {

                                data.features[18].cases = total_cas_pays;
                                data.features[18].totalRecovered = total_gueris_pays;
                                data.features[18].totalDeath = total_mort_pays;
                                data.features[18].properties.liveCases = total_cas;
                                data.features[18].properties.recovered = total_gueris;
                                data.features[18].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-UBANGI") {

                                data.features[19].cases = total_cas_pays;
                                data.features[19].totalRecovered = total_gueris_pays;
                                data.features[19].totalDeath = total_mort_pays;
                                data.features[19].properties.liveCases = total_cas;
                                data.features[19].properties.recovered = total_gueris;
                                data.features[19].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SANKURU") {

                                data.features[20].cases = total_cas_pays;
                                data.features[20].totalRecovered = total_gueris_pays;
                                data.features[20].totalDeath = total_mort_pays;
                                data.features[20].properties.liveCases = total_cas;
                                data.features[20].properties.recovered = total_gueris;
                                data.features[20].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-KIVU") {

                                data.features[21].cases = total_cas_pays;
                                data.features[21].totalRecovered = total_gueris_pays;
                                data.features[21].totalDeath = total_mort_pays;
                                data.features[21].properties.liveCases = total_cas;
                                data.features[21].properties.recovered = total_gueris;
                                data.features[21].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-UBANGI") {

                                data.features[22].cases = total_cas_pays;
                                data.features[22].totalRecovered = total_gueris_pays;
                                data.features[22].totalDeath = total_mort_pays;
                                data.features[22].properties.liveCases = total_cas;
                                data.features[22].properties.recovered = total_gueris;
                                data.features[22].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TANGANYIKA") {

                                data.features[23].cases = total_cas_pays;
                                data.features[23].totalRecovered = total_gueris_pays;
                                data.features[23].totalDeath = total_mort_pays;
                                data.features[23].properties.liveCases = total_cas;
                                data.features[23].properties.recovered = total_gueris;
                                data.features[23].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHOPO") {

                                data.features[24].cases = total_cas_pays;
                                data.features[24].totalRecovered = total_gueris_pays;
                                data.features[24].totalDeath = total_mort_pays;
                                data.features[24].properties.liveCases = total_cas;
                                data.features[24].properties.recovered = total_gueris;
                                data.features[24].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHUAPA") {

                                data.features[25].cases = total_cas_pays;
                                data.features[25].totalRecovered = total_gueris_pays;
                                data.features[25].totalDeath = total_mort_pays;
                                data.features[25].properties.liveCases = total_cas;
                                data.features[25].properties.recovered = total_gueris;
                                data.features[25].properties.death = total_mort;

                                fs.writeFile('./config/cholera.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              }



                            }

                            console.log("My CHOLERA data ", data);

                          });


                        } else if (checkMaladie.maladie === "COVID-19") {

                          jsonReader('./config/covid19.json', (err, data) => {
                            if (err) {
                              console.log("Erreur 1 ", err.message);
                            } else {

                              // BAS-UELE
                              if (provinceParams.toUpperCase() === "BAS-UELE") {

                                data.features[0].cases = total_cas_pays;
                                data.features[0].totalRecovered = total_gueris_pays;
                                data.features[0].totalDeath = total_mort_pays;
                                data.features[0].properties.liveCases = total_cas;
                                data.features[0].properties.recovered = total_gueris;
                                data.features[0].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "EQUATEUR") {

                                data.features[1].cases = total_cas_pays;
                                data.features[1].totalRecovered = total_gueris_pays;
                                data.features[1].totalDeath = total_mort_pays;
                                data.features[1].properties.liveCases = total_cas;
                                data.features[1].properties.recovered = total_gueris;
                                data.features[1].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-KATANGA") {

                                data.features[2].cases = total_cas_pays;
                                data.features[2].totalRecovered = total_gueris_pays;
                                data.features[2].totalDeath = total_mort_pays;
                                data.features[2].properties.liveCases = total_cas;
                                data.features[2].properties.recovered = total_gueris;
                                data.features[2].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-LOMAMI") {
                                data.features[3].cases = total_cas_pays;
                                data.features[3].totalRecovered = total_gueris_pays;
                                data.features[3].totalDeath = total_mort_pays;
                                data.features[3].properties.liveCases = total_cas;
                                data.features[3].properties.recovered = total_gueris;
                                data.features[3].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-UELE") {

                                data.features[4].cases = total_cas_pays;
                                data.features[4].totalRecovered = total_gueris_pays;
                                data.features[4].totalDeath = total_mort_pays;
                                data.features[4].properties.liveCases = total_cas;
                                data.features[4].properties.recovered = total_gueris;
                                data.features[4].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "ITURI") {

                                data.features[5].cases = total_cas_pays;
                                data.features[5].totalRecovered = total_gueris_pays;
                                data.features[5].totalDeath = total_mort_pays;
                                data.features[5].properties.liveCases = total_cas;
                                data.features[5].properties.recovered = total_gueris;
                                data.features[5].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI") {

                                data.features[6].cases = total_cas_pays;
                                data.features[6].totalRecovered = total_gueris_pays;
                                data.features[6].totalDeath = total_mort_pays;
                                data.features[6].properties.liveCases = total_cas;
                                data.features[6].properties.recovered = total_gueris;
                                data.features[6].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI CENTRAL") {

                                data.features[7].cases = total_cas_pays;
                                data.features[7].totalRecovered = total_gueris_pays;
                                data.features[7].totalDeath = total_mort_pays;
                                data.features[7].properties.liveCases = total_cas;
                                data.features[7].properties.recovered = total_gueris;
                                data.features[7].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI ORIENTAL") {

                                data.features[8].cases = total_cas_pays;
                                data.features[8].totalRecovered = total_gueris_pays;
                                data.features[8].totalDeath = total_mort_pays;
                                data.features[8].properties.liveCases = total_cas;
                                data.features[8].properties.recovered = total_gueris;
                                data.features[8].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KINSHASA") {

                                data.features[9].cases = total_cas_pays;
                                data.features[9].totalRecovered = total_gueris_pays;
                                data.features[9].totalDeath = total_mort_pays;
                                data.features[9].properties.liveCases = total_cas;
                                data.features[9].properties.recovered = total_gueris;
                                data.features[9].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KONGO-CENTRAL") {

                                data.features[10].cases = total_cas_pays;
                                data.features[10].totalRecovered = total_gueris_pays;
                                data.features[10].totalDeath = total_mort_pays;
                                data.features[10].properties.liveCases = total_cas;
                                data.features[10].properties.recovered = total_gueris;
                                data.features[10].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWANGO") {

                                data.features[11].cases = total_cas_pays;
                                data.features[11].totalRecovered = total_gueris_pays;
                                data.features[11].totalDeath = total_mort_pays;
                                data.features[11].properties.liveCases = total_cas;
                                data.features[11].properties.recovered = total_gueris;
                                data.features[11].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWILU") {

                                data.features[12].cases = total_cas_pays;
                                data.features[12].totalRecovered = total_gueris_pays;
                                data.features[12].totalDeath = total_mort_pays;
                                data.features[12].properties.liveCases = total_cas;
                                data.features[12].properties.recovered = total_gueris;
                                data.features[12].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LOMAMI") {

                                data.features[13].cases = total_cas_pays;
                                data.features[13].totalRecovered = total_gueris_pays;
                                data.features[13].totalDeath = total_mort_pays;
                                data.features[13].properties.liveCases = total_cas;
                                data.features[13].properties.recovered = total_gueris;
                                data.features[13].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LUALABA") {

                                data.features[14].cases = total_cas_pays;
                                data.features[14].totalRecovered = total_gueris_pays;
                                data.features[14].totalDeath = total_mort_pays;
                                data.features[14].properties.liveCases = total_cas;
                                data.features[14].properties.recovered = total_gueris;
                                data.features[14].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MAI-NDOMBE") {

                                data.features[15].cases = total_cas_pays;
                                data.features[15].totalRecovered = total_gueris_pays;
                                data.features[15].totalDeath = total_mort_pays;
                                data.features[15].properties.liveCases = total_cas;
                                data.features[15].properties.recovered = total_gueris;
                                data.features[15].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MANIEMA") {

                                data.features[16].cases = total_cas_pays;
                                data.features[16].totalRecovered = total_gueris_pays;
                                data.features[16].totalDeath = total_mort_pays;
                                data.features[16].properties.liveCases = total_cas;
                                data.features[16].properties.recovered = total_gueris;
                                data.features[16].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MONGALA") {

                                data.features[17].cases = total_cas_pays;
                                data.features[17].totalRecovered = total_gueris_pays;
                                data.features[17].totalDeath = total_mort_pays;
                                data.features[17].properties.liveCases = total_cas;
                                data.features[17].properties.recovered = total_gueris;
                                data.features[17].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-KIVU") {

                                data.features[18].cases = total_cas_pays;
                                data.features[18].totalRecovered = total_gueris_pays;
                                data.features[18].totalDeath = total_mort_pays;
                                data.features[18].properties.liveCases = total_cas;
                                data.features[18].properties.recovered = total_gueris;
                                data.features[18].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-UBANGI") {

                                data.features[19].cases = total_cas_pays;
                                data.features[19].totalRecovered = total_gueris_pays;
                                data.features[19].totalDeath = total_mort_pays;
                                data.features[19].properties.liveCases = total_cas;
                                data.features[19].properties.recovered = total_gueris;
                                data.features[19].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SANKURU") {

                                data.features[20].cases = total_cas_pays;
                                data.features[20].totalRecovered = total_gueris_pays;
                                data.features[20].totalDeath = total_mort_pays;
                                data.features[20].properties.liveCases = total_cas;
                                data.features[20].properties.recovered = total_gueris;
                                data.features[20].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-KIVU") {

                                data.features[21].cases = total_cas_pays;
                                data.features[21].totalRecovered = total_gueris_pays;
                                data.features[21].totalDeath = total_mort_pays;
                                data.features[21].properties.liveCases = total_cas;
                                data.features[21].properties.recovered = total_gueris;
                                data.features[21].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-UBANGI") {

                                data.features[22].cases = total_cas_pays;
                                data.features[22].totalRecovered = total_gueris_pays;
                                data.features[22].totalDeath = total_mort_pays;
                                data.features[22].properties.liveCases = total_cas;
                                data.features[22].properties.recovered = total_gueris;
                                data.features[22].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TANGANYIKA") {

                                data.features[23].cases = total_cas_pays;
                                data.features[23].totalRecovered = total_gueris_pays;
                                data.features[23].totalDeath = total_mort_pays;
                                data.features[23].properties.liveCases = total_cas;
                                data.features[23].properties.recovered = total_gueris;
                                data.features[23].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHOPO") {

                                data.features[24].cases = total_cas_pays;
                                data.features[24].totalRecovered = total_gueris_pays;
                                data.features[24].totalDeath = total_mort_pays;
                                data.features[24].properties.liveCases = total_cas;
                                data.features[24].properties.recovered = total_gueris;
                                data.features[24].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHUAPA") {

                                data.features[25].cases = total_cas_pays;
                                data.features[25].totalRecovered = total_gueris_pays;
                                data.features[25].totalDeath = total_mort_pays;
                                data.features[25].properties.liveCases = total_cas;
                                data.features[25].properties.recovered = total_gueris;
                                data.features[25].properties.death = total_mort;

                                fs.writeFile('./config/covid19.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              }



                            }

                            console.log("My COVID-19 data ", data);

                          });

                        } else if (checkMaladie.maladie === "TYPHOÏDE") {

                          jsonReader('./config/typhoide.json', (err, data) => {
                            if (err) {
                              console.log("Erreur 1 ", err.message);
                            } else {

                              // BAS-UELE
                              if (provinceParams.toUpperCase() === "BAS-UELE") {

                                data.features[0].cases = total_cas_pays;
                                data.features[0].totalRecovered = total_gueris_pays;
                                data.features[0].totalDeath = total_mort_pays;
                                data.features[0].properties.liveCases = total_cas;
                                data.features[0].properties.recovered = total_gueris;
                                data.features[0].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "EQUATEUR") {

                                data.features[1].cases = total_cas_pays;
                                data.features[1].totalRecovered = total_gueris_pays;
                                data.features[1].totalDeath = total_mort_pays;
                                data.features[1].properties.liveCases = total_cas;
                                data.features[1].properties.recovered = total_gueris;
                                data.features[1].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-KATANGA") {

                                data.features[2].cases = total_cas_pays;
                                data.features[2].totalRecovered = total_gueris_pays;
                                data.features[2].totalDeath = total_mort_pays;
                                data.features[2].properties.liveCases = total_cas;
                                data.features[2].properties.recovered = total_gueris;
                                data.features[2].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-LOMAMI") {
                                data.features[3].cases = total_cas_pays;
                                data.features[3].totalRecovered = total_gueris_pays;
                                data.features[3].totalDeath = total_mort_pays;
                                data.features[3].properties.liveCases = total_cas;
                                data.features[3].properties.recovered = total_gueris;
                                data.features[3].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "HAUT-UELE") {

                                data.features[4].cases = total_cas_pays;
                                data.features[4].totalRecovered = total_gueris_pays;
                                data.features[4].totalDeath = total_mort_pays;
                                data.features[4].properties.liveCases = total_cas;
                                data.features[4].properties.recovered = total_gueris;
                                data.features[4].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "ITURI") {

                                data.features[5].cases = total_cas_pays;
                                data.features[5].totalRecovered = total_gueris_pays;
                                data.features[5].totalDeath = total_mort_pays;
                                data.features[5].properties.liveCases = total_cas;
                                data.features[5].properties.recovered = total_gueris;
                                data.features[5].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI") {

                                data.features[6].cases = total_cas_pays;
                                data.features[6].totalRecovered = total_gueris_pays;
                                data.features[6].totalDeath = total_mort_pays;
                                data.features[6].properties.liveCases = total_cas;
                                data.features[6].properties.recovered = total_gueris;
                                data.features[6].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI CENTRAL") {

                                data.features[7].cases = total_cas_pays;
                                data.features[7].totalRecovered = total_gueris_pays;
                                data.features[7].totalDeath = total_mort_pays;
                                data.features[7].properties.liveCases = total_cas;
                                data.features[7].properties.recovered = total_gueris;
                                data.features[7].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KASAI ORIENTAL") {

                                data.features[8].cases = total_cas_pays;
                                data.features[8].totalRecovered = total_gueris_pays;
                                data.features[8].totalDeath = total_mort_pays;
                                data.features[8].properties.liveCases = total_cas;
                                data.features[8].properties.recovered = total_gueris;
                                data.features[8].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KINSHASA") {

                                data.features[9].cases = total_cas_pays;
                                data.features[9].totalRecovered = total_gueris_pays;
                                data.features[9].totalDeath = total_mort_pays;
                                data.features[9].properties.liveCases = total_cas;
                                data.features[9].properties.recovered = total_gueris;
                                data.features[9].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KONGO-CENTRAL") {

                                data.features[10].cases = total_cas_pays;
                                data.features[10].totalRecovered = total_gueris_pays;
                                data.features[10].totalDeath = total_mort_pays;
                                data.features[10].properties.liveCases = total_cas;
                                data.features[10].properties.recovered = total_gueris;
                                data.features[10].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWANGO") {

                                data.features[11].cases = total_cas_pays;
                                data.features[11].totalRecovered = total_gueris_pays;
                                data.features[11].totalDeath = total_mort_pays;
                                data.features[11].properties.liveCases = total_cas;
                                data.features[11].properties.recovered = total_gueris;
                                data.features[11].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "KWILU") {

                                data.features[12].cases = total_cas_pays;
                                data.features[12].totalRecovered = total_gueris_pays;
                                data.features[12].totalDeath = total_mort_pays;
                                data.features[12].properties.liveCases = total_cas;
                                data.features[12].properties.recovered = total_gueris;
                                data.features[12].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LOMAMI") {

                                data.features[13].cases = total_cas_pays;
                                data.features[13].totalRecovered = total_gueris_pays;
                                data.features[13].totalDeath = total_mort_pays;
                                data.features[13].properties.liveCases = total_cas;
                                data.features[13].properties.recovered = total_gueris;
                                data.features[13].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "LUALABA") {

                                data.features[14].cases = total_cas_pays;
                                data.features[14].totalRecovered = total_gueris_pays;
                                data.features[14].totalDeath = total_mort_pays;
                                data.features[14].properties.liveCases = total_cas;
                                data.features[14].properties.recovered = total_gueris;
                                data.features[14].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MAI-NDOMBE") {

                                data.features[15].cases = total_cas_pays;
                                data.features[15].totalRecovered = total_gueris_pays;
                                data.features[15].totalDeath = total_mort_pays;
                                data.features[15].properties.liveCases = total_cas;
                                data.features[15].properties.recovered = total_gueris;
                                data.features[15].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MANIEMA") {

                                data.features[16].cases = total_cas_pays;
                                data.features[16].totalRecovered = total_gueris_pays;
                                data.features[16].totalDeath = total_mort_pays;
                                data.features[16].properties.liveCases = total_cas;
                                data.features[16].properties.recovered = total_gueris;
                                data.features[16].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "MONGALA") {

                                data.features[17].cases = total_cas_pays;
                                data.features[17].totalRecovered = total_gueris_pays;
                                data.features[17].totalDeath = total_mort_pays;
                                data.features[17].properties.liveCases = total_cas;
                                data.features[17].properties.recovered = total_gueris;
                                data.features[17].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-KIVU") {

                                data.features[18].cases = total_cas_pays;
                                data.features[18].totalRecovered = total_gueris_pays;
                                data.features[18].totalDeath = total_mort_pays;
                                data.features[18].properties.liveCases = total_cas;
                                data.features[18].properties.recovered = total_gueris;
                                data.features[18].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "NORD-UBANGI") {

                                data.features[19].cases = total_cas_pays;
                                data.features[19].totalRecovered = total_gueris_pays;
                                data.features[19].totalDeath = total_mort_pays;
                                data.features[19].properties.liveCases = total_cas;
                                data.features[19].properties.recovered = total_gueris;
                                data.features[19].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SANKURU") {

                                data.features[20].cases = total_cas_pays;
                                data.features[20].totalRecovered = total_gueris_pays;
                                data.features[20].totalDeath = total_mort_pays;
                                data.features[20].properties.liveCases = total_cas;
                                data.features[20].properties.recovered = total_gueris;
                                data.features[20].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-KIVU") {

                                data.features[21].cases = total_cas_pays;
                                data.features[21].totalRecovered = total_gueris_pays;
                                data.features[21].totalDeath = total_mort_pays;
                                data.features[21].properties.liveCases = total_cas;
                                data.features[21].properties.recovered = total_gueris;
                                data.features[21].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "SUD-UBANGI") {

                                data.features[22].cases = total_cas_pays;
                                data.features[22].totalRecovered = total_gueris_pays;
                                data.features[22].totalDeath = total_mort_pays;
                                data.features[22].properties.liveCases = total_cas;
                                data.features[22].properties.recovered = total_gueris;
                                data.features[22].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TANGANYIKA") {

                                data.features[23].cases = total_cas_pays;
                                data.features[23].totalRecovered = total_gueris_pays;
                                data.features[23].totalDeath = total_mort_pays;
                                data.features[23].properties.liveCases = total_cas;
                                data.features[23].properties.recovered = total_gueris;
                                data.features[23].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHOPO") {

                                data.features[24].cases = total_cas_pays;
                                data.features[24].totalRecovered = total_gueris_pays;
                                data.features[24].totalDeath = total_mort_pays;
                                data.features[24].properties.liveCases = total_cas;
                                data.features[24].properties.recovered = total_gueris;
                                data.features[24].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              } else if (provinceParams.toUpperCase() === "TSHUAPA") {

                                data.features[25].cases = total_cas_pays;
                                data.features[25].totalRecovered = total_gueris_pays;
                                data.features[25].totalDeath = total_mort_pays;
                                data.features[25].properties.liveCases = total_cas;
                                data.features[25].properties.recovered = total_gueris;
                                data.features[25].properties.death = total_mort;

                                fs.writeFile('./config/typhoide.json', JSON.stringify(data, null, 2), (err) => {

                                  if (err) {
                                    console.log("Erreur dans writeFile ", err.message);
                                  }

                                });

                              }

                            }

                            console.log("My TYPHOIDE data ", data);

                          });

                        }

                        res.status(200).send({
                          cas: value,
                          cas_confirmer: total_cas,
                          cas_gueris: total_gueris,
                          cas_mort: total_mort
                        });

                      }).catch((error) => {
                        next(error);
                      });

                    });

                  } catch (error) {
                    res.status(500).send({ message: "Erreur de district maladie", error: error });
                  }

                }).catch((error) => {
                  next(error);
                });

                // end zone de sante
              });

            }).catch((error) => {
              next(error);
            });
            // end localite

          });

        }).catch((error) => {
          next(error);
        });
        // end district

      });

    }).catch((error) => {
      next(error);
    });
    // end ville

  }).catch((error) => {
    next(error);
  });


}

/*

function jsonReader(filePath, cb) {
  fs.readFile(filePath, 'utf-8', (err, fileData) => {
    if (err) {
      return cb && cb(err);
    } else {
      try {
        const object = JSON.parse(fileData);
        return cb && cb(null, object);
      } catch (error) {
        return cb && cb(error);
      }
    }

  });

}

*/
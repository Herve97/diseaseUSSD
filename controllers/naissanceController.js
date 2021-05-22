const Naissance = require('../models/Naissance');
const Province = require('../models/Province');
const Localite = require('../models/Localite');
const Territoire = require('../models/Territoire');
const Ville = require('../models/Ville');
const ZoneSante = require('../models/ZoneSante');
const fs = require('fs');

function jsonReader(filePath, cb) {
  fs.readFile(filePath, 'utf-8', (err, fileData) => {
    if(err) {
      return cb && cb(err);
    }else {
      try {
        const object = JSON.parse(fileData);
        return cb && cb(null, object);
      } catch (error) {
        return cb && cb(error);
      }
    }

  });

}

// get naissance by localité
exports.getNaissanceByLocalite = async (req, res, next) => {
    
    const localite = req.params.localite;
    var total_naissance = 0;
    var total_mort_ne = 0;

    const checkLocalite = await Localite.findOne({nom: localite})

    const checkZone = await ZoneSante.find({localite: checkLocalite._id});

    try {

        checkZone.forEach(async (val) =>{

            await Naissance.find({zonesante: val._id}).then(async (result)=>{
                result.forEach(async (valNaiss)=>{
                    total_naissance += valNaiss.naissance;
                    total_mort_ne += valNaiss.mort_ne;
                });

                console.log("Somme des naissances ", total_cas);
                console.log("Somme des mort né ", total_gueris);
                res.status(200).send({naissance: total_naissance, mort_ne: total_mort_ne});
            }).catch((error)=>{ 
                return next(new Error('Localite does not exist'));
                res.status(500).send(error);
            })

        });
       
    } catch (error) {
        next(error)
    }
}

// get naissance name by district
exports.getNaissanceByDistrict = async (req, res, next) => {
    const territoire = req.params.territoire;
    var total_naissance = 0;
    var total_mort_ne = 0;

    const checkTerritoire = await Territoire.findOne({nom: territoire});

    await Localite.find({territoire: checkTerritoire._id}).then(async (localite)=>{
        // Localite

        localite.forEach(async (valLocalite)=>{

            // Zone de santé

            await ZoneSante.find({localite: valLocalite._id}).then(async (zone)=>{

                try {

                    zone.forEach(async (val) =>{

                        await Naissance.find({zonesante: val._id}).then(async (result)=>{
                            result.forEach(async (valNaiss)=>{
                                total_naissance += valNaiss.naissance;
                                total_mort_ne += valNaiss.mort_ne;
                            });

                            console.log("Somme des naissances ", total_cas);
                            console.log("Somme des mort né ", total_gueris);
                            res.status(200).send({naissance: total_naissance, mort_ne: total_mort_ne});
                        }).catch((error)=>{ 
                            return next(new Error('Localite does not exist'));
                            res.status(500).send(error);
                        });

                    });
       
                } catch (error) {
                    next(error);
                }

            }).catch((error)=>{
                return next(new Error('Localite does not exist'));
                res.status(500).send(error);
            });

            // End zone de santé

        });

        // End localite
    }).catch((error)=>{
        return next(new Error('Localite does not exist'));
        res.status(500).send(error);
    });

   
}


// get naissance by ville
exports.getNaissanceByVille = async (req, res, next) => {

    const villeParams = req.params.ville;
    var total_naissance = 0;
    var total_mort_ne = 0;

   await Ville.findOne({nom: villeParams}).then(async (ville) =>{

    // district
    await District.find({ville: ville._id}).then(async (district)=>{

      district.forEach(async (valDistrict) =>{

        // localite
        await Localite.find({district: valDistrict._id}).then(async (localite)=>{

          localite.forEach(async (valLocalite) =>{

            // zone de sante
            await ZoneSante.find({localite: valLocalite._id}).then((zonesante)=>{
                  
              try {
    
                zonesante.forEach(async (zone_sante) => {

                  await Naissance.find({zonesante: zone_sante._id}).then(async (result)=>{

                    result.forEach((value) =>{
                      total_naissance += valNaiss.naissance;
                      total_mort_ne += valNaiss.mort_ne;
                    });

                    console.log("Somme des naissances ", total_cas);
                    console.log("Somme des mort né ", total_gueris);
                    res.status(200).send({naissance: total_naissance, mort_ne: total_mort_ne});
                      
                  }).catch((error)=>{
                    next(error);
                  });

                });

              } catch (error) {
                res.status(500).send({message: "Erreur de district naissance", error: error});
              }

            }).catch((error)=>{
              next(error);
            });

            // end zone de sante

          });


        }).catch((error)=>{
          next(error);
        });
        // end localite

      });

    });

    // end district

  }).catch((error)=>{
    next(error);
  });
}

// get naissance name by province
exports.getNaissanceByProvince = async (req, res, next) => {
   const provinceParams = req.params.province;

   var total_naissance_pays = 0;
   var total_mort_ne_pays = 0;

   var total_naissance = 0;
   var total_mort_ne = 0;

    await Naissance.find().then(async (naiss) =>{

        naissa.forEach((naissValue)=>{
            total_naissance_pays += naissValue.naissance;
            total_mort_ne_pays += naissValue.mort_ne;
        });

        console.log("Somme des naissances Pays", total_naissance_pays);
        onsole.log("Somme des mort né Pays", total_mort_ne_pays);
    

    }).catch((error) =>{
        console.log("Erreur somme pays");
        next(error);
    });


    await Province.findOne({nom: provinceParams}).then(async (province)=>{

        // ville
        await Ville.find({province: province._id}).then(async (ville)=>{

            ville.forEach(async (valVille) =>{

                // district
                await Territoire.find({ville: valVille._id}).then(async (territoire)=>{

                    territoire.forEach(async (valTerritoire) =>{

                        // localite
                        await Localite.find({district: valTerritoire._id}).then(async (localite)=>{

                            localite.forEach(async (valLocalite) =>{

                                // zone de sante
                                await ZoneSante.find({localite: valLocalite._id}).then((zonesante)=>{
                  
                                    try {
    
                                        zonesante.forEach(async (zone_sante) => {

                                            await Naissance.find({zonesante: zone_sante._id}).then(async (result)=>{

                                                result.forEach((value) =>{
                                                    total_naissance += valNaiss.naissance;
                                                    total_mort_ne += valNaiss.mort_ne;
                                                });

                                                console.log("Somme des naissances ", total_naissance);
                                                console.log("Somme des mort né ", total_mort_ne);

                                                jsonReader('./config/naissance.json', (err, data)=>{

                                                    if(err){
                                                        console.log("Erreur 1 ", err.message);
                                                    }else{

                                                        console.log("My features ", data.features[0].properties);

                                                        // BAS-UELE
                                                        if(provinceParams.toUpperCase() === "BAS-UELE"){

                                                            data.features[0].totalRecovered = total_naissance_pays;
                                                            data.features[0].totalDeath = total_mort_ne_pays;
                                                            data.features[0].properties.liveCases = total_naissance;
                                                            data.features[0].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "EQUATEUR"){

                                                            data.features[1].totalRecovered = total_naissance_pays;
                                                            data.features[1].totalDeath = total_mort_ne_pays;
                                                            data.features[1].properties.liveCases = total_naissance;
                                                            data.features[1].properties.death = total_mort_ne;
                                

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "HAUT-KATANGA"){

                                                            data.features[2].totalRecovered = total_naissance_pays;
                                                            data.features[2].totalDeath = total_mort_ne_pays;
                                                            data.features[2].properties.liveCases = total_naissance;
                                                            data.features[2].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "HAUT-LOMAMI"){
                                                            data.features[3].totalRecovered = total_naissance_pays;
                                                            data.features[3].totalDeath = total_mort_ne_pays;
                                                            data.features[3].properties.liveCases = total_naissance;
                                                            data.features[3].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "HAUT-UELE"){

                                                            data.features[4].totalRecovered = total_naissance_pays;
                                                            data.features[4].totalDeath = total_mort_ne_pays;
                                                            data.features[4].properties.liveCases = total_naissance;
                                                            data.features[4].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/ebola.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "ITURI"){

                                                            data.features[5].totalRecovered = total_naissance_pays;
                                                            data.features[5].totalDeath = total_mort_ne_pays;
                                                            data.features[5].properties.liveCases = total_naissance;
                                                            data.features[5].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "KASAI"){

                                                            data.features[6].totalRecovered = total_naissance_pays;
                                                            data.features[6].totalDeath = total_mort_ne_pays;
                                                            data.features[6].properties.liveCases = total_naissance;
                                                            data.features[6].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "KASAI CENTRAL"){

                                                            data.features[7].totalRecovered = total_naissance_pays;
                                                            data.features[7].totalDeath = total_mort_ne_pays;
                                                            data.features[7].properties.liveCases = total_naissance;
                                                            data.features[7].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "KASAI ORIENTAL"){

                                                            data.features[8].totalRecovered = total_naissance_pays;
                                                            data.features[8].totalDeath = total_mort_ne_pays;
                                                            data.features[8].properties.liveCases = total_naissance;
                                                            data.features[8].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "KINSHASA"){

                                                            data.features[9].totalRecovered = total_naissance_pays;
                                                            data.features[9].totalDeath = total_mort_ne_pays;
                                                            data.features[9].properties.liveCases = total_naissance;
                                                            data.features[9].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "KONGO-CENTRAL"){

                                                            data.features[10].totalRecovered = total_naissance_pays;
                                                            data.features[10].totalDeath = total_mort_ne_pays;
                                                            data.features[10].properties.liveCases = total_naissance;
                                                            data.features[10].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "KWANGO"){

                                                            data.features[11].totalRecovered = total_naissance_pays;
                                                            data.features[11].totalDeath = total_mort_ne_pays;
                                                            data.features[11].properties.liveCases = total_naissance;
                                                            data.features[11].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "KWILU"){

                                                            data.features[12].totalRecovered = total_naissance_pays;
                                                            data.features[12].totalDeath = total_mort_ne_pays;
                                                            data.features[12].properties.liveCases = total_naissance;
                                                            data.features[12].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "LOMAMI"){

                                                            data.features[13].totalRecovered = total_naissance_pays;
                                                            data.features[13].totalDeath = total_mort_ne_pays;
                                                            data.features[13].properties.liveCases = total_naissance;
                                                            data.features[13].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "LUALABA"){

                                                            data.features[14].totalRecovered = total_naissance_pays;
                                                            data.features[14].totalDeath = total_mort_ne_pays;
                                                            data.features[14].properties.liveCases = total_naissance;
                                                            data.features[14].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "MAI-NDOMBE"){

                                                            data.features[15].totalRecovered = total_naissance_pays;
                                                            data.features[15].totalDeath = total_mort_ne_pays;
                                                            data.features[15].properties.liveCases = total_naissance;
                                                            data.features[15].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "MANIEMA"){

                                                            data.features[16].totalRecovered = total_naissance_pays;
                                                            data.features[16].totalDeath = total_mort_ne_pays;
                                                            data.features[16].properties.liveCases = total_naissance;
                                                            data.features[16].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "MONGALA"){

                                                            data.features[17].totalRecovered = total_naissance_pays;
                                                            data.features[17].totalDeath = total_mort_ne_pays;
                                                            data.features[17].properties.liveCases = total_naissance;
                                                            data.features[17].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "NORD-KIVU"){

                                                            data.features[18].totalRecovered = total_naissance_pays;
                                                            data.features[18].totalDeath = total_mort_ne_pays;
                                                            data.features[18].properties.liveCases = total_naissance;
                                                            data.features[18].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "NORD-UBANGI"){

                                                            data.features[19].totalRecovered = total_naissance_pays;
                                                            data.features[19].totalDeath = total_mort_ne_pays;
                                                            data.features[19].properties.liveCases = total_naissance;
                                                            data.features[19].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "SANKURU"){

                                                            data.features[20].totalRecovered = total_naissance_pays;
                                                            data.features[20].totalDeath = total_mort_ne_pays;
                                                            data.features[20].properties.liveCases = total_naissance;
                                                            data.features[20].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "SUD-KIVU"){

                                                            data.features[21].totalRecovered = total_naissance_pays;
                                                            data.features[21].totalDeath = total_mort_ne_pays;
                                                            data.features[21].properties.liveCases = total_naissance;
                                                            data.features[21].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "SUD-UBANGI"){

                                                            data.features[22].totalRecovered = total_naissance_pays;
                                                            data.features[22].totalDeath = total_mort_ne_pays;
                                                            data.features[22].properties.liveCases = total_naissance;
                                                            data.features[22].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "TANGANYIKA"){

                                                            data.features[23].totalRecovered = total_naissance_pays;
                                                            data.features[23].totalDeath = total_mort_ne_pays;
                                                            data.features[23].properties.liveCases = total_naissance;
                                                            data.features[23].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "TSHOPO"){

                                                            data.features[24].totalRecovered = total_naissance_pays;
                                                            data.features[24].totalDeath = total_mort_ne_pays;
                                                            data.features[24].properties.liveCases = total_naissance;
                                                            data.features[24].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }else if(provinceParams.toUpperCase() === "TSHUAPA"){

                                                            data.features[25].totalRecovered = total_naissance_pays;
                                                            data.features[25].totalDeath = total_mort_ne_pays;
                                                            data.features[25].properties.liveCases = total_naissance;
                                                            data.features[25].properties.death = total_mort_ne;

                                                            fs.writeFile('./config/naissance.json', JSON.stringify(data, null, 2), (err) =>{

                                                                if(err){
                                                                    console.log("Erreur dans writeFile ", err.message);
                                                                }

                                                            });

                                                        }                             

                                                    }

                                                    console.log("My Naissance data ", data);

                                                });



                                                res.status(200).send({naissance: total_naissance, mort_ne: total_mort_ne});
                      
                                            }).catch((error)=>{
                                                next(error);
                                            });

                                        });

                                    } catch (error) {
                                        res.status(500).send({message: "Erreur de district naissance", error: error});
                                    }

                                }).catch((error)=>{
                                    next(error);
                                });

                                // end zone de sante

                            });

                        });

                    });

                }).catch((error)=>{
                    next(error);
                });

            });

        }).catch((error)=>{
            next(error);
        });


    }).catch((error)=>{
        next(error);
    });


}
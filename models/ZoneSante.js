const mongoose = require('mongoose');

const ZoneSanteSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  nom: {
    type: String
  },
  localite: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Localite"
  },
  territoire: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Territoire"
  },
  ville: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Ville"
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Province"
  },
  cas: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Cas"
  }]
});

const ZoneSante = mongoose.model('ZoneSante', ZoneSanteSchema);

module.exports = ZoneSante;
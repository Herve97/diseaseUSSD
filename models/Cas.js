const mongoose = require('mongoose');

const CasSchema = new mongoose.Schema({
  cas_confirmer: {
    type: Number,
    required: true,
    default: 0
  },
  nombre_gueris: {
    type: Number,
    required: true,
    default: 0
  },
  nombre_deces: {
    type: Number,
    required: true,
    default: 0
  },
  naissance: {
    type: Number,
    required: true,
    default: 0
  },
  mort_ne: {
    type: Number,
    required: true,
    default: 0
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
  maladie: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Maladie"
  },
  zonesante: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"ZoneSante"
  }
}, {timestamps: true});

const Cas = mongoose.model('Cas', CasSchema);

module.exports = Cas;

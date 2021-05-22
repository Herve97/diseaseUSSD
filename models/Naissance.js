const mongoose = require('mongoose');

const NaissanceSchema = new mongoose.Schema({
  naissance: {
    type: Number,
    required: true,
  },
  mort_ne: {
    type: Number,
    required: true,
  },
  province: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Province"
  }],
  ville: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Ville"
  }],
  Territoire: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Territoire"
  }],
  localite: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Localite"
  }],
  zonesante: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"ZoneSante"
  }
}, {timestamps: true});

const Naissance = mongoose.model('Naissance', NaissanceSchema);

module.exports = Naissance;

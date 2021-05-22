const mongoose = require('mongoose');

const TerritoireSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  code:{
    type: String,
    required: true
  },
  lat:{
    type: Number,
    required: true
  },
  long:{
    type: Number,
    required: true
  },
  ville: {
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Ville'
  },
  maladie: [{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Maladie'
  }],
  cas: [{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Cas'
  }],
  localite: [{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Localite'
  }],
  zonesante: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"ZoneSante"
  }]
});

const Territoire = mongoose.model('Territoire', TerritoireSchema);

module.exports = Territoire;
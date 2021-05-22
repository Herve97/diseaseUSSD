const mongoose = require('mongoose');

const LocaliteSchema = new mongoose.Schema({
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
  territoire: {
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Territoire'
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
  zonesante: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"ZoneSante"
  }]
});

const Localite = mongoose.model('Localite', LocaliteSchema);

module.exports = Localite;
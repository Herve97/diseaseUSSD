const mongoose = require('mongoose');

const VilleSchema = new mongoose.Schema({
  
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
  province: {
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Province'
  },
  territoire: [{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'Territoire'
  }],
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

const Ville = mongoose.model('Ville', VilleSchema);

module.exports = Ville;
const mongoose = require('mongoose');

const ProvinceSchema = new mongoose.Schema({
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
  ville: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Ville'
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

const Province = mongoose.model('Province', ProvinceSchema);

module.exports = Province;

/*

  ,
  zonesante: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'ZoneSante'
  }]

*/
const mongoose = require('mongoose');

const MaladieSchema = new mongoose.Schema({
  maladie: {
    type: String,
    required: true,
  },
  localite: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Localite"
  }],
  territoire: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Territoire"
  }],
  ville: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Ville"
  }],
  province: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Province"
  }],
  cas: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Cas"
  }]
}, {timestamps: true});

const Maladie = mongoose.model('Maladie', MaladieSchema);

module.exports = Maladie;

/*

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


*/
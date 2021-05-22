const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  telephone: {
    type: String
  },
  zone_sante:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"ZoneSante"
  }
}, {timestamps: true});

const User = mongoose.model('User', UserSchema);

module.exports = User;

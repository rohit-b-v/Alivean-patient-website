const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  dname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hname: {
    type: String,
    required: true
  },
  hbranch: {
    type: String,
    required: true
  },
  hcity: {
    type: String,
    required: true
  },
  expertise: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
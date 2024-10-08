const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, 'bhanurai001@gmail.com'],
  },
  
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },

  contact: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  profileImage: {
    type: String,
    required: false,
  },
 
  token: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  userImageUrl: {
    type: String,
    required: false,
  },

  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  accountLocked: {
    type: Boolean,
    default: false,
  },
  lastFailedLoginAttempt: {
    type: Date,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
});

const Users = mongoose.model("user", userSchema);
module.exports = Users;
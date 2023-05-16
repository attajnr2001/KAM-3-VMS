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
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  role: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "active",
  },

  dob: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

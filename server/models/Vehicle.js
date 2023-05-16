const mongoose = require("mongoose");

const vehicleSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },

  number: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  color: {
    type: String,
    required: true,
  },

  rwStart: {
    type: Date,
    required: true,
  },

  rwRenew: {
    type: Date,
    required: true,
  },

  insType: {
    type: String,
    required: true,
  },

  insCompany: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
  },
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle;

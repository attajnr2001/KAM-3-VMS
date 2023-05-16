const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  whatsapp: {
    type: String,
    required: true,
    unique: true,
  },

  company: {
    type: String,
    default: "No company",
  },

  gender: {
    type: String,
    required: true,
  },

  lClass: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "active",
  },

  lNo: {
    type: String,
    required: true,
  },

  refNo: {
    type: String,
    required: true,
  },

  issueDate: {
    type: Date,
    required: true,
  },

  lRenewOne: {
    type: Date,
    required: true,
  },

  lRenewTwo: {
    type: Date,
    required: true,
  },

  lExpiry: {
    type: Date,
    required: true,
  },

  dob: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
  },

  coverImage: {
    type: Buffer,
    required: true,
  },

  coverImageType: {
    type: String,
    required: true,
  },
});

customerSchema.virtual("coverImagePath").get(function () {
  if (this.coverImage != null && this.coverImageType != null) {
    return `data: ${
      this.coverImageType
    }; charset=utf-8;base64, ${this.coverImage.toString("base64")}`;
  }
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;

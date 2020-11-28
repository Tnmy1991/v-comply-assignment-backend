require("dotenv").config();

const mongoose = require("mongoose");

const vendorSchema = mongoose.Schema({
  vendor_name: {
    type: String,
    required: [true, "The username field is required."],
    trim: true,
    unique: 1
  },
  sequential_approvers: {
    type: String,
    required: [true, "The sequential approvers field is required."],
  },
  round_robin_approvers: {
    type: String,
    required: [true, "The round-robin approvers field is required."],
  },
  any_one_approvers: {
    type: String,
    required: [true, "The any-one approvers field is required."],
  },
  workflow_status: {
    type: String,
    default: ""
  },
  created_at: { 
    type: Date,
    default: Date.now
  }
});
 
const Vendor = mongoose.model("vendors", vendorSchema);
module.exports = { Vendor }
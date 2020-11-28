require("dotenv").config();

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "The username field is required."],
    trim: true,
    unique: 1
  },
  full_name: {
    type: String,
    required: [true, "The full name field is required."],
    trim: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: [true, "The password field is required!"],
    minlength: 5
  },
  role: { 
    type: String, 
    maxlength: 10,
    default: 'approvers' 
  },
  created_at: { 
    type: Date,
    default: Date.now
  }
});
 
const User = mongoose.model("users", userSchema);
module.exports = { User }
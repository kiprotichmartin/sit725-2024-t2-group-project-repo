const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false, // Do not return password in queries by default
  },
  socialLinks: {
    facebook: { type: String, validate: [validator.isURL, "Invalid URL"] },
    twitter: { type: String, validate: [validator.isURL, "Invalid URL"] },
    instagram: { type: String, validate: [validator.isURL, "Invalid URL"] },
    linkedin: { type: String, validate: [validator.isURL, "Invalid URL"] },
    // Add more platforms as needed
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);

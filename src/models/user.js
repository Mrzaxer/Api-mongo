// src/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  departamento: {
    type: String,
    required: true,
  },  
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    
  },
  role: {
    type: String,
    enum: ['admin', 'inquilino'], 
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

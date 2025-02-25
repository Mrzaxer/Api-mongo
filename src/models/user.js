const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // La contraseña ya no será encriptada
  role: { type: String, required: true },
  direccion: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);

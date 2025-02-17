const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

const SECRET_KEY = 'tu_clave_secreta_super_segura'; // ⚠️ Usa variables de entorno en producción

// 📌 Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { nombre, email, phone, password, role, direccion } = req.body;

  if (!nombre || !email || !phone || !password || !role || !direccion) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'El número de teléfono o el correo ya están registrados' });
    }

    // Crear usuario y guardar en la base de datos
    const newUser = new User({ nombre, email, phone, password, role, direccion });
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario', error: err });
  }
});

// 📌 Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Teléfono y contraseña son obligatorios' });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, direccion: user.direccion },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token, // Enviar token al frontend
      role: user.role,
      direccion: user.direccion
    });

  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

// 📌 Ruta protegida (solo accesible con token válido)
router.get('/usuarios', authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: err });
  }
});

module.exports = router;

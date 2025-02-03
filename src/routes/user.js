const express = require('express');
const router = express.Router();
const User = require('../models/user'); 

// 📌 Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { departamento, phone, password, role } = req.body;

  // Validación de datos
  if (!departamento || !phone || !password || !role) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'El número de teléfono ya está registrado' });
    }

    // Crear nuevo usuario
    const newUser = new User({ departamento, phone, password, role });
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
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
    // Buscar usuario por número de teléfono
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña (sin encriptar)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Respuesta con el rol del usuario
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      role: user.role,
      departamento: user.departamento
    });

  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

// 📌 Ruta para obtener todos los usuarios (Opcional)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: err });
  }
});

module.exports = router;

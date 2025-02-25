const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticateToken = require('../middleware/authMiddleware');  // Asegúrate de que esté correctamente importado
require('dotenv').config();

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const TOKEN_EXPIRATION = '2h';
const REFRESH_EXPIRATION = '7d';

// Modelo de Token para almacenar Refresh Tokens (Usa MongoDB en lugar de un array)
const RefreshToken = require('../models/refreshToken');

// Ruta para registrar un nuevo usuario (sin encriptar contraseñas)
router.post('/register', async (req, res) => {
  const { nombre, email, phone, password, role, direccion } = req.body;

  if (!nombre || !email || !phone || !password || !role || !direccion) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'El número de teléfono o el correo ya están registrados' });
    }

    // Guardar contraseña en texto plano (⚠️ No recomendado en producción)
    const newUser = new User({ nombre, email, phone, password, role, direccion });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
});

// Ruta para iniciar sesión (sin bcrypt)
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Teléfono y contraseña son obligatorios' });
  }

  try {
    // Buscar el usuario por número de teléfono
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña directamente
    if (password !== user.password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar Access Token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, direccion: user.direccion },
      ACCESS_TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Generar Refresh Token
    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_EXPIRATION }
    );

    // Eliminar cualquier refreshToken previo de ese usuario
    await RefreshToken.deleteMany({ userId: user._id });

    // Guardar el nuevo refreshToken en la base de datos
    await RefreshToken.create({ token: refreshToken, userId: user._id });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      accessToken,
      refreshToken,
      role: user.role,
      direccion: user.direccion
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Ruta para generar un nuevo Access Token con un Refresh Token
router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh Token ausente' });
  }

  try {
    // Verificar si el refresh token está en la base de datos
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: 'Refresh Token inválido' });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Refresh Token inválido' });

      const user = await User.findById(decoded.userId);
      if (!user) return res.status(403).json({ message: 'Usuario no encontrado' });

      const newAccessToken = jwt.sign(
        { userId: user._id, role: user.role, direccion: user.direccion },
        ACCESS_TOKEN_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Ruta protegida (solo accesible con Access Token válido)
router.get('/usuarios', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: err.message });
  }
});

// Ruta para cerrar sesión (elimina el Refresh Token)
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    await RefreshToken.deleteOne({ token: refreshToken });
    res.status(200).json({ message: 'Sesión cerrada' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Ruta para cambiar la contraseña (requiere autenticación)
router.put('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId; // ID del usuario autenticado

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Ambas contraseñas son requeridas.' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar la contraseña actual (sin hash)
    if (user.password !== currentPassword) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
    }

    // Actualizar la contraseña
    user.password = newPassword;
    await user.save();

    // Eliminar todos los Refresh Tokens para invalidar sesiones activas
    await RefreshToken.deleteMany({ userId: user._id });

    res.json({ message: 'Contraseña cambiada exitosamente, todas las sesiones se han cerrado.' });

  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor.', error: err.message });
  }
});


module.exports = router;

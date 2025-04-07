const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

const SECRET_KEY = 'tu_clave_secreta_super_segura';  // ⚠️ Usa variables de entorno
const REFRESH_SECRET_KEY = 'tu_refresh_token_super_seguro'; // ⚠️ Usa variables de entorno

// Ruta para iniciar sesión (modificada para incluir refreshToken)
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

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar access token (válido por 2 horas)
    const token = jwt.sign(
      { userId: user._id, role: user.role, direccion: user.direccion },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    // Generar refresh token (válido por 7 días)
    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Guardar el refreshToken en una cookie segura
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token, // Enviar accessToken al frontend
      role: user.role,
      direccion: user.direccion
    });

  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

module.exports = router;

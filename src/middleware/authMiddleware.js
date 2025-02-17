const jwt = require('jsonwebtoken');

const SECRET_KEY = 'tu_clave_secreta_super_segura'; // ⚠️ Usa variables de entorno en producción

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    req.user = decoded; // Guardamos los datos del usuario en `req.user`
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;

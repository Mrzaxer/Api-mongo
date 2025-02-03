require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');  // Asegúrate de que el archivo db.js esté en la raíz
const userRoutes = require('./src/routes/user');  // Rutas de usuarios
const multaRoutes = require('./src/routes/multa');  // Rutas de multas
const notificacionRoutes = require('./src/routes/notificacion');  // Rutas de notificaciones


const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);  // Ruta para los usuarios
app.use('/api/multas', multaRoutes);  // Ruta para las multas
app.use('/api/notificaciones', notificacionRoutes);  // Ruta para las notificaciones
// Puerto del servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

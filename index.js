require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');  // Conectar a la BD
const authMiddleware = require('./src/middleware/authMiddleware');  // Middleware JWT
const userRoutes = require('./src/routes/user');
const multaRoutes = require('./src/routes/multa');
const notificacionRoutes = require('./src/routes/notificacion');

const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas públicas
app.use('/api/users', userRoutes);  

// Rutas protegidas con JWT
app.use('/api/multas', authMiddleware, multaRoutes);  
app.use('/api/notificaciones', authMiddleware, notificacionRoutes);  

// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

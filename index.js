require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');  // Conectar a la BD
const authMiddleware = require('./src/middleware/authMiddleware');  // Middleware JWT
const userRoutes = require('./src/routes/user');
const multaRoutes = require('./src/routes/multa');
const notificacionRoutes = require('./src/routes/notificacion');
const cookieParser = require('cookie-parser');

const app = express();

// Configuración de CORS para permitir solicitudes con credenciales
const corsOptions = {
  origin: 'http://localhost:5173',  // El origen de tu frontend
  credentials: true,  // Permitir el uso de cookies/credenciales
};

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors(corsOptions));  // Aplica la configuración de CORS
app.use(express.json());
app.use(cookieParser());  // Middleware para manejar cookies

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

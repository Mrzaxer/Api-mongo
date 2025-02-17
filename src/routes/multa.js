const express = require('express');
const router = express.Router();
const Multa = require('../models/multa'); 
const Notificacion = require('../models/notificacion'); 
const authMiddleware = require('../middleware/authMiddleware'); // Importar middleware de autenticación

// Crear una nueva multa y enviar notificación (PROTEGIDA)
router.post('/no', authMiddleware, async (req, res) => {
  try {
    const { direccion, motivo, monto, estado } = req.body;

    // Crear la multa
    const nuevaMulta = new Multa({
      direccion,
      motivo,
      monto,
      estado
    });

    await nuevaMulta.save();

    // Crear una notificación asociada a la multa
    const nuevaNotificacion = new Notificacion({
      departamento: direccion, // Usamos 'direccion' porque en tu lógica equivale a 'departamento'
      mensaje: `Se ha registrado una nueva multa: ${motivo}. Monto: $${monto}. Estado: ${estado}`,
      leida: false
    });

    await nuevaNotificacion.save();

    res.status(201).json({
      message: 'Multa y notificación creadas exitosamente',
      multa: nuevaMulta,
      notificacion: nuevaNotificacion
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la multa', error: err.message });
  }
});

// Obtener todas las multas (PROTEGIDA)
router.get('/si', authMiddleware, async (req, res) => {
  try {
    const multas = await Multa.find(); 
    res.status(200).json(multas); 
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las multas', error: err.message });
  }
});

module.exports = router;

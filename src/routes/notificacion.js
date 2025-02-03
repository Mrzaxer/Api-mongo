const express = require('express');
const router = express.Router();
const Notificacion = require('../models/notificacion');

// Crear una nueva notificación
router.post('/', async (req, res) => {
    try {
        const { departamento, mensaje } = req.body;
        const nuevaNotificacion = new Notificacion({
            departamento,
            mensaje,
            leida: false
        });

        await nuevaNotificacion.save();
        res.status(201).json(nuevaNotificacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la notificación' });
    }
});

// Obtener todas las notificaciones de un departamento
router.get('/:departamento', async (req, res) => {
    try {
        const { departamento } = req.params;
        const notificaciones = await Notificacion.find({ departamento });
        res.status(200).json(notificaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
});

// Marcar una notificación como leída
router.put('/:id/leida', async (req, res) => {
    try {
        const { id } = req.params;
        const notificacion = await Notificacion.findByIdAndUpdate(id, { leida: true }, { new: true });

        if (!notificacion) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }

        res.status(200).json(notificacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al marcar la notificación como leída' });
    }
});

// 🚀 ELIMINAR UNA NOTIFICACIÓN POR ID (Nueva función)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notificacion = await Notificacion.findByIdAndDelete(id);

        if (!notificacion) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }

        res.status(200).json({ message: 'Notificación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la notificación' });
    }
});

module.exports = router;

//notificacion-models

const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    departamento: {
        type: String,
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },
    leida: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notificacion = mongoose.model('Notificacion', notificacionSchema);

module.exports = Notificacion;

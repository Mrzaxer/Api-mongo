//

const mongoose = require('mongoose');

// Definir el esquema para las multas
const multaSchema = new mongoose.Schema({
  direccion: {
    type: String,
    required: true,  // Dirección del inquilino es obligatoria
  },
  motivo: {
    type: String,
    required: true,  // Motivo de la multa es obligatorio
  },
  monto: {
    type: Number,
    required: true,  // El monto de la multa es obligatorio
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado'],  // Solo puede ser uno de estos estados
    default: 'pendiente',  // Estado por defecto es "pending"
  }
}, { timestamps: true });  // Timestamps para mantener las fechas de creación y actualización automáticamente

// Crear y exportar el modelo de la multa
const Multa = mongoose.model('Multa', multaSchema);

module.exports = Multa;

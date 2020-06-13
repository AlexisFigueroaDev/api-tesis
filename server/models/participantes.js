const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let participantesSchema = new Schema({
    nombre_participante: { type: String, required: [true, 'El nombre es requerido'] },
    apellido_participante: { type: String, required: [true, 'El apellido es requerido'] },
    dni_participante: { type: Number, required: [true, 'El DNI es requerido'], min: 1000000, max: 99999999 },
    fec_nac: { type: Date, required: [true, 'La fecha de nacimiento es obligatoria \' YYYY-MM-DD \''] },
    sexo_participante: { type: Boolean, default: true },
    profesionales: { type: Schema.Types.ObjectId, ref: 'Profesionales', required: [true, 'El id del profesional es requerido'] },
    competicion: [{ type: Schema.Types.ObjectId, ref: 'Competicion' }],
    total: { type: Number, default: 0 }
});

module.exports = mongoose.model('Participantes', participantesSchema);
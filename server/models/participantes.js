const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let participantesSchema = new Schema({
    nombre_participante: { type: String, required: [true, 'El nombre es requerido'] },
    apellido_participante: { type: String, required: [true, 'El apellido es requerido'] },
    dni_participante: { type: Number, required: [true, 'El DNI es requerido'], unique: [true, 'El DNI debe ser unico'] },
    sexo_participante: { type: Boolean, default: true },
    profesionales: { type: Schema.Types.ObjectId, ref: 'Profesionales', required: [true, 'El id del profesional es requerido'] }
});


module.exports = mongoose.model('Participantes', participantesSchema);
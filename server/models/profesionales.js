const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let profesionalesSchema = new Schema({
    club: { type: String, required: [true, 'El nombre del club o escuela es obligatorio'] },
    bi_pro: { type: Boolean, default: false },
    nombre_tecnico: { type: String, required: [true, 'El nombre del tecnico es requerido'] },
    apellido_tecnico: { type: String, required: [true, 'El apellido del tecnico es requerido'] },
    DNI_tecnico: { type: Number, required: [true, 'El DNI del tecnico es requerido'], unique: true },
    tel_tecnico: { type: Number, required: [true, 'El tel del tecnico es requerido'] },
    nombre_delegado: { type: String, default: 'VACIO' },
    apellido_delegado: { type: String, default: 'VACIO' },
    DNI_delegado: { type: Number, default: 99999999 },
    tel_delegado: { type: Number, default: 99999999 },
    torneo: { type: Schema.Types.ObjectId, ref: 'Torneo', required: [true, 'el id del torneo es obligatorio'] }
});

module.exports = mongoose.model('Profesionales', profesionalesSchema);
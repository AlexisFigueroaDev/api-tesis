const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let d = new Date();
let day = d.getDate();
let month = d.getMonth();
let year = d.getFullYear();


let torneoSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripción es obligatoria'],
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: Boolean,
        default: true
    },
    total: { type: Number, default: 0 }
});


module.exports = mongoose.model('Torneo', torneoSchema);
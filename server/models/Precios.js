const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let especialidadesValidas = {
    values: ['LIBRE', 'ESCUELA'],
    message: '{VALUE} no es un especialidad válida'
}

let preciosSchema = new Schema({

    descripcion: { type: String, enum: especialidadesValidas, required: [true, 'La descripcion es requerido'] },
    precio: { type: Number, required: [true, 'El precio es requerido'] },

});

module.exports = mongoose.model('Precios', preciosSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let especialidadesValidas = {
    values: ['LIBRE', 'ESCUELA'],
    message: '{VALUE} no es un especialidad válida'
}

let divisionalesValidas = {
    values: ['A', 'B', 'C', 'D'],
    message: '{VALUE} no es una divisional válida'
}

let categoriasValidas = {
    values: ['INICIACION', 'AVANZADO', 'FORMATIVA', 'PROMOCIONAL', 'NACIONAL', 'NACIONAL-ELITE', '5', '4', '3', '2', '1'],
    message: '{VALUE} no es una categoria válida'
}

let subcategoriasValidas = {
    values: ['TOTS', 'PRE-MINI', 'MINI-INFANTIL', 'INFANTIL', 'CADETE', 'JUVENIL', 'JUNIOR', 'SENIOR', 'EDAD'],
    message: '{VALUE} no es una subcaterogia válida'
}

let competicionSchema = new Schema({
    especialidad: { type: String, enum: especialidadesValidas, required: [true, 'El nombre de la especialidad es obligatorio'] },
    divisional: { type: String, enum: divisionalesValidas, required: [true, 'El nombre de la divisional es obligatorio'] },
    categoria: { type: String, enum: categoriasValidas, required: [true, 'El nombre de la categoria es obligatorio'] },
    subCategoria: { type: String, enum: subcategoriasValidas, default: 'EDAD' },
    participante: { type: Schema.Types.ObjectId, ref: 'Participante', required: [true, 'el id del participante es obligatorio'] }
});




module.exports = mongoose.model('Competicion', competicionSchema);
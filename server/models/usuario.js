const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//VALIDACION PARA TIPO DE DATOS Q PUEDEN INGRESAR
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

//ESQUEMA QUE TIENE LA BASE DE DATOS, ES UNA CLASE 
let usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
    password: { type: String, required: [true, 'La constraseña es obligatoria'] },
    img: { type: String, required: false },
    role: { type: String, default: 'USER_ROLE', enum: rolesValidos },
    estado: { type: Boolean, default: true },
    google: { type: Boolean, default: false }
});


//OCULTAR CAMPO QUE DEVUELVE EL JSON
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

//MANEJO DE ERRORES UNIQUE
usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser unico'
});

//EXPORTAMOS ESTA CLASE
module.exports = mongoose.model('Usuario', usuarioSchema);
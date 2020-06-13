require('./config/config');

const express = require('express');

const mongoose = require('mongoose');
const path = require('path');

const app = express();

const bodyParser = require('body-parser');


//MANEJO DE FORMULARIOS BODY POST
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json());


app.use(express.static(path.resolve(__dirname, '../public')));


console.log('Direccion ' + path.resolve(__dirname, '../public'));

//CONFIGURACION GLOBAL DE RUTAS
app.use(require('./routes/index'));

//CONEXION BASE DE DATOS
mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;
    console.log(`Base de datos ONLINE ${process.env.URLDB}`);
});


//==================
// Variable de entorno PORT
// se exporta del archivo CONFIG.JS
//==================
app.listen(process.env.PORT, () => {
    console.log(`Escuchando el puerto ${process.env.PORT}`);
});
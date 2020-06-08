const express = require('express');
//ENCRIPTAR CONTRASEÑA
const bcrypt = require('bcrypt');
//LIBRERIA QUE SIRVE PARA DEVOLVER UNA PARTE DE UN OBJETO
const _ = require('underscore');
//TRAEMOS LA CLASE USUARIO DEL ESQUEMA 
const Usuario = require('../Models/usuario');


const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const app = express();

//==================
// Agregar nuevo usuario
//==================
app.post('/usuario', function(req, res) {

    let body = req.body;

    // CREAMOS UNA NUEVA INSTACIA DEL OBJETO MODELO USUARIO
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //ALMACENAMOS EL NUEVO USAURIO EN LA BASE DE DATOS
    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });


});

//==================
// Consulto usuarios
//==================

app.get('/usuario', [verificaToken, verificaAdminRol], (req, res) => {


    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email,
    // })

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    //EL STRING DEVUELVE LOS CAMPOS Q LES DIGO
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({ estado: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });


            });


        })



});


module.exports = app;
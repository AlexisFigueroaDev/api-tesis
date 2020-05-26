const express = require('express');

let app = express();

let Precios = require('../Models/precios');

//==================
// MOSTRAR PRECIOS
//==================
app.get('/precios', (req, res) => {

    Precios.find({})
        .sort('descripcion')
        .exec((err, precio) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                precio
            })
        })

});

//==================
// Crear nuevo precio 
//==================
app.post('/precios', (req, res) => {
    let body = req.body;

    let precio = new Precios({
        descripcion: body.descripcion,
        precio: body.precio
    });

    precio.save((err, precioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!precioDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            precio: precioDB,

        });
    });

});

//==================
// buscar precio de una especialidad
//==================
app.get('/precios/:id', (req, res) => {
    let id = req.params.id;
    let resultado;

    let variable = id.toUpperCase();
    console.log(variable);
    Precios.findOne({ descripcion: variable })
        .exec((err, precioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!precioDB) {
                return res.status(500).json({
                    ok: false,
                    message: 'No existe precio para la especialidad'
                });
            }

            res.json({
                ok: true,
                precio: precioDB,
            });
        });

});

module.exports = app;
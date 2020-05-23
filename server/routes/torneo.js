const express = require('express');

let app = express();

let Torneo = require('../Models/torneo');

const _ = require('underscore');


//==================
// MOSTRAR TORNEOS
//==================
app.get('/torneo', (req, res) => {

    Torneo.find({})
        .populate('Profesionales', 'club')
        .sort('descripcion')
        .exec((err, torneo) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                torneo
            })
        })

});

//==================
// Crear nuevo torneo
//==================
app.post('/torneo', (req, res) => {
    let body = req.body;

    let torneo = new Torneo({
        descripcion: body.descripcion,
        fecha: body.fecha,
        estado: body.estado
    });


    torneo.save((err, torneoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!torneoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            torneo: torneoDB,

        });


    });


});



module.exports = app;
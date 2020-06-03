const express = require('express');

let app = express();

let Torneo = require('../Models/torneo');
let Profesional = require('../Models/profesionales');

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
        });


});

//==================
// Crear nuevo torneo
//==================
app.post('/torneo', (req, res) => {
    let body = req.body;

    let torneo = new Torneo({
        descripcion: body.descripcion,
        fecha: body.fecha,
        estado: body.estado,
        total: body.total
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


//==================
// MOSTRAR TORNEOS X ID
//==================
app.get('/torneo/:id', (req, res) => {

    let id = req.params.id;

    Torneo.findById(id)
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
            });

        }); //Torneo.findById(id)




});



module.exports = app;
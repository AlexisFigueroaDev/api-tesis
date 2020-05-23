const express = require('express');

let app = express();

let Profesionales = require('../Models/profesionales');


//==================
// Crear nuevo profesional
//==================
app.post('/profesionales', (req, res) => {
    let body = req.body;

    let profesionales = new Profesionales({
        club: body.club,
        bi_pro: body.bi_pro,
        nombre_tecnico: body.nombre_tecnico,
        apellido_tecnico: body.apellido_tecnico,
        DNI_tecnico: body.DNI_tecnico,
        tel_tecnico: body.tel_tecnico,
        nombre_delegado: body.nombre_delegado,
        apellido_delegado: body.apellido_delegado,
        DNI_delegado: body.DNI_delegado,
        tel_delegado: body.tel_delegado,
        torneo: body.torneo
    });


    profesionales.save((err, profesionalDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!profesionalDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            profesionales: profesionalDB,

        });


    });


});


//==================
// MOSTRAR Profesionales 
//==================
app.get('/profesionales', (req, res) => {

    Profesionales.find({})
        .populate('torneo', ['descripcion', 'fecha'])
        .sort('club')
        .exec((err, profesionales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                profesionales
            })
        })

});



module.exports = app;
const express = require('express');

let app = express();

let Participantes = require('../Models/participantes');
let Profesional = require('../Models/profesionales');
let { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

//====================================
// Crear nuevo Participantes
//====================================
app.post('/participantes', verificaToken, (req, res) => {
    let body = req.body;

    let participantes = new Participantes({
        nombre_participante: body.nombre_participante,
        apellido_participante: body.apellido_participante,
        dni_participante: body.dni_participante,
        fec_nac: body.fec_nac,
        sexo_participante: body.sexo_participante,
        profesionales: body.profesionales,
        competicion: body.competicion
    });

    let id = body.profesionales;

    Profesional.findById(id, (err, profesional) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!profesional) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El profesional no existe'
                }
            });
        }


        participantes.save((err, participantesDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!participantesDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                participantes: participantesDB,

            });


        });

    }); //Valido si el profesional existe


});




//========================================================================
// Mostrar los participantes con sus profesionales y torneo inscripto
//========================================================================
app.get('/participantes', [verificaToken, verificaAdminRol], (req, res) => {

    Participantes.find({})
        .populate({
            path: 'profesionales',
            populate: {
                path: 'torneo'
            }
        })
        .populate({
            path: 'competicion'

        })
        .sort('nombre_participante')
        .exec((err, participantes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                participantes
            })
        })

});


module.exports = app;
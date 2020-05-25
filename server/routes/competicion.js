const express = require('express');

let app = express();

let Competicion = require('../Models/Competicion');
let Participantes = require('../Models/participantes');


//====================================
//Crear nueva competicion al participante
//====================================
app.post('/competicion', (req, res) => {
    let body = req.body;

    let competicion = new Competicion({
        especialidad: body.especialidad,
        divisional: body.divisional,
        categoria: body.categoria,
        subCategoria: body.subCategoria,
        participante: body.participante
    });

    let id = body.participante;
    let subCategoria = body.subCategoria;
    let especialidad = body.especialidad;
    let divisional = body.divisional;
    let categoria = body.categoria;


    let valida = 0;

    function validacion(valida) {
        if (especialidad === 'ESCUELA') {
            if (divisional === 'C' || divisional === 'B' || divisional === 'A') {
                if (categoria !== 'INICIACION' && categoria !== 'AVANZADO') {
                    return valida = 1;
                }
            }
        }
        if (especialidad === 'LIBRE') {
            if (divisional === 'C' || divisional === 'B' || divisional === 'A' || divisional === 'D') {
                return valida = 2
            }
        }
        return valida;
    }

    validacion(valida);
    console.log(`Resultado de la funcion ${validacion(valida)}`);

    if (valida !== 0) {
        Participantes.findById(id, (err, participante) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!participante) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El participante no existe'
                    }
                });
            }

            competicion.save((err, competicionDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if (!competicionDB) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    competicion: competicionDB

                });

                let idCompeticion = competicionDB._id;
                let idParticipante = competicionDB.participante;
                //==================
                // BUSCO EL ID DE PARTICIPANTE SI EXISTE EN LA COLECCION Y TRAIGO SU FECHA DE NACIMIENTO
                //==================

                Participantes.findOne({ _id: idParticipante })
                    .exec((err, participanteDB) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                err
                            });
                        }

                        if (!participanteDB) {
                            return res.status(400).json({
                                ok: false,
                                err

                            });
                        }

                        //==================
                        // Desarmar la fecha de nacimiento del participante
                        //==================
                        let fecha = participanteDB.fec_nac;

                        let mes = new Date(fecha).getMonth() + 1;
                        let dia = new Date(fecha).getDate() + 1;
                        let año = new Date(fecha).getFullYear();

                        let calEdad = calculoEdad(dia, mes, año);


                        console.log(`Funcion calculo edad:  ${calEdad}`);



                        //==================
                        // BUSCO EL ID AGREGADO RECIENTE DE LA COMPETICION DONDE LA SUBCATEGORIA ES EDAD Y LO ACTUALIZO
                        //==================
                        let query = { '_id': `${idCompeticion}`, 'subCategoria': 'EDAD' };


                        if (subCategoria === 'EDAD' || subCategoria === undefined) {
                            Competicion.findByIdAndUpdate(query, { $set: { subCategoria: calEdad } }, (err, participantesDB) => {

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

                                console.log(`Participante ${participantesDB._id} acutalizado con la edad de ${calEdad}`);
                            });
                        }


                        //==================
                        // AGREGO LA COMPETICION EN RELACION AL PARTICIPANTE
                        //==================

                        Participantes.update({ _id: idParticipante }, { $push: { competicion: idCompeticion } }, (err, participantesDB) => {
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

                            console.log(`Participante ${ participanteDB._id} acutalizado`);
                        }); // al participante buscado le agrego la nueva competicion





                    }); //findOne participante la edad

            }); //save Competicion

        }); //busco si el participante que envian es valido
    } else {
        res.status(412).json({
            ok: false,
            message: 'La asignacion de la competicion no corresponde a las reglas de negocio'

        });
    }

});


function calculoEdad(dia, mes, año) {
    let edad = 0;

    let añoActual = new Date().getFullYear();
    let mesActual = new Date().getMonth() + 1;
    let diaActual = new Date().getDate();

    edad = añoActual - año;

    if (mes > mesActual || dia > diaActual) {
        edad = edad - 1
    } else {
        edad = edad
    }

    return edad;
};


module.exports = app;
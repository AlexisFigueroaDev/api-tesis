const express = require('express');

let app = express();

let Participantes = require('../Models/participantes');
let Profesional = require('../Models/profesionales');
let Competicion = require('../Models/Competicion');
let Torneo = require('../Models/torneo');
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

//==================
// Editar profesionales
//==================

app.put('/participantes/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    update = {
        nombre_participante: body.nombre_participante,
        apellido_participante: body.apellido_participante,
        dni_participante: body.dni_participante,
        fec_nac: body.fec_nac,
        sexo_participante: body.sexo_participante
    }

    Participantes.findById(id).exec((err, participantesDB) => {
        if (err) {
            return console.log(err);
        }

        let nombre_participante = participantesDB.nombre_participante;
        let apellido_participante = participantesDB.apellido_participante;
        let dni_participante = participantesDB.dni_participante;
        let fec_nac = participantesDB.fec_nac;
        let sexo_participante = participantesDB.sexo_participante;

        //Variables Modificables

        let nombre_participante_mod = '';
        let apellido_participante_mod = '';
        let dni_participante_mod = 0;
        let fec_nac_mod = new Date();
        let sexo_participante_mod = true;

        if (nombre_participante !== update.nombre_participante) {
            nombre_participante_mod = update.nombre_participante
        }

        if (update.nombre_participante === undefined) {
            nombre_participante_mod = nombre_participante
        };

        if (apellido_participante !== update.apellido_participante) {
            apellido_participante_mod = update.apellido_participante
        }

        if (update.apellido_participante === undefined) {
            apellido_participante_mod = apellido_participante
        };

        if (dni_participante !== update.dni_participante) {
            dni_participante_mod = update.dni_participante
        }

        if (update.dni_participante === undefined) {
            dni_participante_mod = dni_participante
        };

        if (fec_nac !== update.fec_nac) {
            fec_nac_mod = update.fec_nac
        }

        if (update.dni_participante === undefined) {
            fec_nac_mod = fec_nac
        };

        if (sexo_participante !== update.sexo_participante) {
            sexo_participante_mod = update.sexo_participante
        }

        if (update.sexo_participante === undefined) {
            sexo_participante_mod = sexo_participante
        };

        insert = {
            nombre_participante: nombre_participante_mod,
            apellido_participante: apellido_participante_mod,
            dni_participante: dni_participante_mod,
            fec_nac: fec_nac_mod,
            sexo_participante: sexo_participante_mod
        }

        Participantes.findByIdAndUpdate(id, insert, (err, participantesDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!participantesDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'El participante no existe'
                });
            }


            Participantes.findById(id).exec((err, participantesDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    participante: participantesDB
                });

            }); //Participantes.findById

        }); //Participantes.findByIdAndUpdate

    }); //Participantes.findById

});


//==================
// Eliminar participante
//==================

app.delete('/participante/:id', [verificaToken, verificaAdminRol], (req, res) => {

    let id = req.params.id;

    //==================
    // Busco las competiciones que tienen el participante asosiado
    //==================

    Participantes.findById(id).exec((err, participantesDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        if (!participantesDB) {
            return res.status(400).json({
                ok: false,
                message: 'El participante no existe'
            });
        }

        Competicion.find().where({ participante: id }).exec((err, competicionDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                });
            }

            if (!competicionDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'El participante no esta asociado a una competicion'
                });
            }

            let arrayComp = [];
            let valorComp = '';

            tamañoComp = competicionDB.length;

            for (let i = 0; i < tamañoComp; i++) {

                valorComp = competicionDB[i]._id

                arrayComp.push(valorComp);
            }

            console.log(`arrayComp (COMPETICIONES PARA BORRAR): ${arrayComp}`);


            //==================
            // Busco el profesional asosiado al participante
            //==================

            Participantes.findById(id, (err, participantesDB) => {
                if (err) {
                    return console.log(err);
                }

                if (!participantesDB) {
                    return console.log('El participante no existe');
                }

                let idProfe = participantesDB.profesionales._id;

                console.log(`ID del profesional ${idProfe}`);


                //==================
                // Busco el monto que tiene le profesional
                //==================
                Profesional.findById(idProfe, (err, profesionalDB) => {

                    if (err) {
                        return console.log(err);
                    }

                    let montoPro = profesionalDB.total;

                    console.log(`El monto del profesional ${montoPro}`);

                    let Idtorneo = profesionalDB.torneo._id;

                    console.log(`El id del torneo ${Idtorneo}`);



                    //==================
                    // Busco el monto que tiene el torneo cargado
                    //==================
                    Torneo.findById(Idtorneo, (err, torneoDB) => {

                        if (err) {
                            return console.log(err);
                        }

                        let montoTorneo = torneoDB.total;

                        console.log(`El monto total del torneo ${montoTorneo}`);


                        //==================
                        // Busco el monto el total a pagar el participante
                        //==================

                        Participantes.findById(id, (err, participantesDB) => {
                            if (err) {
                                return console.log(err);
                            }

                            let montoParticipante = participantesDB.total;

                            console.log(`El monto total cargado en el participante ${montoParticipante}`);


                            //==================
                            // Actualizo el monto del profesional al borrar el participante
                            //==================

                            let nuevomontoPro = montoPro - montoParticipante
                            let updateTorneo = montoTorneo - montoParticipante

                            console.log(`Nuevo monto del profesional ${nuevomontoPro}`);
                            console.log(`Nuevo monto del Torneo ${updateTorneo}`);

                            Profesional.update({ _id: idProfe }, { total: nuevomontoPro }, (err, profesionalDB) => {
                                    if (err) {
                                        return console.log(err);
                                    }

                                    console.log(`Profesional actualizado con ID: ${idProfe} con el monto ${nuevomontoPro}`);

                                }) //Profesional.update

                            Torneo.update({ _id: Idtorneo }, { total: updateTorneo }, (err, torneoDB) => {

                                if (err) {
                                    return console.log(err);
                                }

                                console.log(`Torneo actualizado con ID: ${idProfe} con el monto ${nuevomontoPro}`);

                            }); //Torneo.update

                            //==================
                            // Borro las competiciones
                            //==================

                            Competicion.find().where({ participante: id }).exec((err, competicionDB) => {
                                if (err) {
                                    return console.log(err);
                                }

                                let arrayComp = [];
                                let valorComp = '';

                                tamañoComp = competicionDB.length;

                                for (let i = 0; i < tamañoComp; i++) {

                                    valorComp = competicionDB[i]._id

                                    arrayComp.push(valorComp);
                                }

                                console.log(`valorComp (COMPETICION PARA BORRAR) ${arrayComp}`);


                                //BORRO LA COMPETICION
                                Competicion.remove({ "_id": { $in: arrayComp } }, (err, competicionDB) => {
                                    if (err) {
                                        return console.log(err);
                                    }

                                    if (!competicionDB) {
                                        return console.log('No se pudo borrar de forma correcta');
                                    }

                                    console.log(`Se borraron de forma correcta los id ${arrayComp}`);
                                }); //Competicion.remove


                                console.log(`arrayComp (ARREGLO DE COMPETICIONES PARA BORRAR) ${arrayComp}`);

                                //BORRO EL PARTICIPANTE
                                Participantes.remove({ "_id": { $in: id } }, (err, participantesDB) => {
                                    if (err) {
                                        return console.log(err);
                                    }

                                    if (!participantesDB) {
                                        return console.log('No se pudo borrar de forma correcta');
                                    }

                                    console.log(`Se borra el participante con el id ${id}`);


                                    res.json({
                                        ok: false,
                                        message: 'Se borraron los datos de forma correcta'
                                    })
                                }); //Participantes.remove





                            }); // Competicion.find().where





                        }); //Participantes.findById

                    }); //Torneo.findById

                }); //Profesional.findById

            }); //Participantes.findById

        }); //Competicion.find()

    }); //participante.findById(id)
});

module.exports = app;
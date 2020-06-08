const express = require('express');

let app = express();
let { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');
let Profesionales = require('../Models/profesionales');
let Participante = require('../Models/participantes');
let Competicion = require('../Models/Competicion');
let Torneo = require('../Models/torneo');


//==================
// Crear nuevo profesional
//==================
app.post('/profesionales', verificaToken, (req, res) => {
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
        torneo: body.torneo,
        total: body.total
    });


    let id = body.torneo;

    Torneo.findById(id, (err, torneo) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!torneo) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El torneo no existe'
                }
            });
        }


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

    }); //valido que el torneo exista


});


//==================
// MOSTRAR Profesionales con sus torneos
//==================
app.get('/profesionales', verificaToken, (req, res) => {

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

            if (!profesionales) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                profesionales
            });

        }); //FIN funcion Find Profesionales

}); // FIN MOSTRAR Profesionales con sus torneos


//==================
// Se modifica Datos del Profesional
//==================

app.put('/profesional/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let update = {
        club: body.club,
        nombre_tecnico: body.nombre_tecnico,
        apellido_tecnico: body.apellido_tecnico,
        DNI_tecnico: body.DNI_tecnico,
        tel_tecnico: body.tel_tecnico,
        nombre_delegado: body.nombre_delegado,
        apellido_delegado: body.apellido_delegado,
        DNI_delegado: body.DNI_delegado,
        tel_delegado: body.tel_delegado,
        torneo: body.torneo
    }

    Profesionales.findById(id).exec((err, profesionalDB) => {

        if (err) {
            return console.log(err);
        }


        let nombre_tecnico = profesionalDB.nombre_tecnico;
        let apellido_tecnico = profesionalDB.apellido_tecnico;
        let DNI_tecnico = profesionalDB.DNI_tecnico;
        let tel_tecnico = profesionalDB.tel_tecnico;
        let nombre_delegado = profesionalDB.nombre_delegado;
        let apellido_delegado = profesionalDB.apellido_delegado;
        let DNI_delegado = profesionalDB.DNI_delegado;
        let tel_delegado = profesionalDB.tel_delegado;
        let torneo = profesionalDB.torneo;
        let club = profesionalDB.club;


        //Variables modificados
        let nombre_tecnico_mod = '';
        let apellido_tecnico_mod = '';
        let DNI_tecnico_mod = 0;
        let tel_tecnico_mod = 0;
        let nombre_delegado_mod = '';
        let apellido_delegado_mod = '';
        let DNI_delegado_mod = 0;
        let tel_delegado_mod = 0;
        let torneo_mod = 0;
        let club_mod = '';

        if (nombre_tecnico !== update.nombre_tecnico) {
            nombre_tecnico_mod = update.nombre_tecnico
        }

        if (update.nombre_tecnico === undefined) {
            nombre_tecnico_mod = nombre_tecnico
        };

        if (apellido_tecnico !== update.apellido_tecnico) {
            apellido_tecnico_mod = update.apellido_tecnico
        }
        if (update.apellido_tecnico === undefined) {
            apellido_tecnico_mod = apellido_tecnico
        };

        if (nombre_delegado !== update.nombre_delegado) {
            nombre_delegado_mod = update.nombre_delegado
        }
        if (update.nombre_delegado === undefined) {
            nombre_delegado_mod = nombre_delegado
        };

        if (apellido_delegado !== update.apellido_delegado) {
            apellido_delegado_mod = update.apellido_delegado
        }
        if (update.apellido_delegado === undefined) {
            apellido_delegado_mod = apellido_delegado
        };

        if (torneo !== update.torneo) {
            torneo_mod = update.torneo
        }
        if (update.torneo === undefined) {
            torneo_mod = torneo
        };

        if (club !== update.club) {
            club_mod = update.club
        }
        if (update.club === undefined) {
            club_mod = club
        };

        if (DNI_tecnico !== update.DNI_tecnico) {
            DNI_tecnico_mod = update.DNI_tecnico
        }
        if (update.DNI_tecnico === undefined) {
            DNI_tecnico_mod = DNI_tecnico
        };

        if (tel_tecnico !== update.tel_tecnico) {
            tel_tecnico_mod = update.tel_tecnico
        }
        if (update.tel_tecnico === undefined) {
            tel_tecnico_mod = tel_tecnico
        };

        if (DNI_delegado !== update.DNI_delegado) {
            DNI_delegado_mod = update.DNI_delegado
        }
        if (update.DNI_delegado === undefined) {
            DNI_delegado_mod = DNI_delegado
        };

        if (tel_delegado !== update.tel_delegado) {
            tel_delegado_mod = update.tel_delegado
        }
        if (update.tel_delegado === undefined) {
            tel_delegado_mod = tel_delegado
        };

        insert = {
            nombre_tecnico: nombre_tecnico_mod,
            apellido_tecnico: apellido_tecnico_mod,
            nombre_delegado: nombre_delegado_mod,
            apellido_delegado: apellido_delegado_mod,
            torneo: torneo_mod,
            club: club_mod,
            DNI_tecnico: DNI_tecnico_mod,
            tel_tecnico: tel_tecnico_mod,
            DNI_delegado: DNI_delegado_mod,
            tel_delegado: tel_delegado_mod
        }

        // return res.json({
        //     mensaje: console.log(insert)
        // })

        Profesionales.findByIdAndUpdate(id, insert, (err, profesionalDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!profesionalDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'El profesional no existe'
                });
            }

            // res.json({
            //     ok: true,
            //     profesional: profesionalDB
            // });

            //console.log('Se actualizo el profesional' + profesionalDB);

            Profesionales.findById(id).exec((err, profesionalDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    profesional: profesionalDB
                });

            });
        }); //Profesionales.findByIdAndUpdate

    }); //Profesionales.findById



});


//==================
// Borrar profesionales por Id
//==================

app.delete('/profesional/:id', [verificaToken, verificaAdminRol], (req, res) => {


    let id = req.params.id;

    //==================
    // Busco los patinadores que tienen ese mismo id del profesional
    //==================

    Participante.find().where({ profesionales: id }).exec((err, participanteDB) => {
        if (err) {
            return console.log(err);
        }

        if (!participanteDB) {
            return console.log('El participante no existe');
        }

        let arrayPart = [];
        let valorPart = '';

        tamañoPart = participanteDB.length;

        for (let i = 0; i < tamañoPart; i++) {

            valorPart = participanteDB[i]._id

            arrayPart.push(valorPart);
        }

        console.log(`arrayPart (PARTICIPANTES PARA BORRAR): ${arrayPart}`);

        //BORRAR PARTICIPANTES
        Participante.remove({ "_id": { $in: arrayPart } }, (err, participantesDB) => {
            if (err) {
                return console.log(err);
            }

            if (!participantesDB) {
                return console.log('No se pudo borrar de forma correcta');
            }

            console.log(`Se borraron de forma correcta los id ${arrayPart}`);
        });


        //==================
        // Busco las competiciones que tienen asociados los participantes
        //==================
        Competicion.find().where({ participante: arrayPart }).exec((err, competicionDB) => {
            if (err) {
                return console.log(err);
            }

            if (!competicionDB) {
                return console.log('La competicion no existe');
            }

            let arrayComp = [];
            let valorComp = '';

            tamañoComp = competicionDB.length;

            for (let i = 0; i < tamañoComp; i++) {

                valorComp = competicionDB[i]._id

                arrayComp.push(valorComp);
            }

            console.log(`valorComp (COMPETICION PARA BORRAR) ${arrayComp}`);


            //BORRAR COMPETICIONES
            Competicion.remove({ "_id": { $in: arrayComp } }, (err, competicionDB) => {
                if (err) {
                    return console.log(err);
                }

                if (!competicionDB) {
                    return console.log('No se pudo borrar de forma correcta');
                }

                console.log(`Se borraron de forma correcta los id ${arrayComp}`);
            });


            //==================
            // Busco el monto asignado del profesional del total a pagar
            //==================

            Profesionales.findById(id, (err, profesionalDB) => {
                if (err) {
                    return console.log(err);
                }

                let montoPro = profesionalDB.total;

                let idTorneo = profesionalDB.torneo;

                console.log(`montoPro (MONTO TOTAL DEL PROFESIONAL ACUMULADO) ${montoPro}`);
                console.log(`idTorneo (ID TORNEO DEL PROFESIONAL) ${idTorneo}`);

                //BORRAR PROFESIONALES
                Profesionales.remove({ "_id": id }, (err, competicionDB) => {
                    if (err) {
                        return console.log(err);
                    }

                    if (!competicionDB) {
                        return console.log('No se pudo borrar de forma correcta');
                    }

                    console.log(`Se borraron de forma correcta el profesional ${id}`);
                });

                //==================
                // actualizo el monto del torneo 
                //==================

                Torneo.findById(idTorneo, (err, torneoDB) => {
                    if (err) {
                        return console.log(err);
                    }

                    let montoTorneo = torneoDB.total;

                    console.log(`montoTorneo (MONTO TOTAL DEL TORNEO) ${montoTorneo}`);

                    let updateTorneo = montoTorneo - montoPro


                    Torneo.update({ _id: idTorneo }, { total: updateTorneo }, (err, torneoDB) => {
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

                        console.log(`TORNEO ${ torneoDB._id} acutalizado con el monto ${updateTorneo}`);

                        res.json({
                            ok: true,
                            message: 'Profesional Borrado'
                        })

                    }); //Torneo.update

                }); //Torneo.findById

            }); //Profesionales.findById

        }); //Competicion.find()

    }); //Participante.find()

});




module.exports = app;
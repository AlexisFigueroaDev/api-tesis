const express = require('express');

let app = express();

let { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

let Torneo = require('../Models/torneo');
let Profesionales = require('../Models/profesionales');
let Participantes = require('../Models/participantes');
let Competicion = require('../Models/Competicion');

const _ = require('underscore');


//==================
// MOSTRAR TORNEOS
//==================
app.get('/torneo', verificaToken, (req, res) => {

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
app.post('/torneo', [verificaToken, verificaAdminRol], (req, res) => {
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
app.get('/torneo/:id', verificaToken, (req, res) => {

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


//==================
// Editar Torneo 
//==================

app.put('/torneo/:id', [verificaToken, verificaAdminRol], (req, res) => {
    let id = req.params.id;
    let body = req.body;



    let descripcion = body.descripcion;
    let fecha = body.fecha;



    Torneo.findByIdAndUpdate(id, { descripcion, fecha }, { new: true, runValidators: true }, (err, torneoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!torneoDB) {
            return res.status(400).json({
                ok: false,
                message: 'El torneo no existe'
            });
        }

        res.json({
            ok: true,
            torneo: torneoDB
        });
    })



});

//==================
// Eliminar Torneo
//==================

app.delete('/torneo/:id', [verificaToken, verificaAdminRol], (req, res) => {

    let id = req.params.id;

    Torneo.findByIdAndRemove(id, (err, torneoDB) => {

        //==================
        // Busco los profesionales asignados a ese torneo y los borros
        //==================


        Profesionales.find().where({ torneo: id }).exec((err, profesionalesDB) => {

            if (err) {
                return console.log(err);
            }

            if (!profesionalesDB) {
                return console.log('El profesional no existe');
            }

            let array = [];
            let valor = '';

            tamaño = profesionalesDB.length;

            console.log(tamaño);


            for (let i = 0; i < tamaño; i++) {

                valor = profesionalesDB[i]._id

                array.push(valor);
            }


            console.log('Arreglo de profesioanles a barrar ' + array); //ARRAY PARA BORRAR ESOS ID

            Profesionales.remove({ "_id": { $in: array } }, (err, profesionalesDB) => {
                if (err) {
                    return console.log(err);
                }

                if (!profesionalesDB) {
                    return console.log('No se pudo borrar de forma correcta');
                }

                console.log(`Se borraron de forma correcta los id ${array}`);

            });

            //==================
            // Buscar los patinadores que tiene asociados ese profesional borrado
            //==================

            Participantes.find().where({ profesionales: { $in: array } }).exec((err, participantesDB) => {
                if (err) {
                    return console.log(err);
                }

                if (!participantesDB) {
                    return console.log('El participante no existe');
                }

                let arrayPart = [];
                let valorPart = '';

                tamañoPart = participantesDB.length;

                console.log(tamañoPart);


                for (let i = 0; i < tamañoPart; i++) {

                    valorPart = participantesDB[i]._id

                    arrayPart.push(valorPart);
                }


                console.log('Arreglo de Participantes a barrar arrayPart ' + arrayPart);

                Participantes.remove({ "_id": { $in: arrayPart } }, (err, participantesDB) => {
                    if (err) {
                        return console.log(err);
                    }

                    if (!participantesDB) {
                        return console.log('No se pudo borrar de forma correcta');
                    }

                    console.log(`Se borraron de forma correcta los id ${arrayPart}`);
                });



                //==================
                // Borrar las competencias asignadas a los participantes
                //==================


                Competicion.find().where({ participante: { $in: arrayPart } }).exec((err, competicionDB) => {
                    if (err) {
                        return console.log(err);
                    }

                    if (!competicionDB) {
                        return console.log('El participante no existe');
                    }

                    let arrayComp = [];
                    let valorComp = '';

                    tamañoComp = competicionDB.length;

                    console.log(tamañoComp);


                    for (let i = 0; i < tamañoComp; i++) {

                        valorComp = competicionDB[i]._id

                        arrayComp.push(valorComp);
                    }


                    console.log('Arreglo de Competicion a barrar ' + arrayComp);

                    Competicion.remove({ "_id": { $in: arrayComp } }, (err, competicionDB) => {
                        if (err) {
                            return console.log(err);
                        }

                        if (!competicionDB) {
                            return console.log('No se pudo borrar de forma correcta');
                        }

                        console.log(`Se borraron de forma correcta los id ${arrayComp}`);
                    });

                }); //Competicion.find()

            }); //Participantes.find()

        }); //Profesionales.find()


        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!torneoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Torneo Borrado'
        });

    }); //Torneo.findByIdAndRemove

});




module.exports = app;
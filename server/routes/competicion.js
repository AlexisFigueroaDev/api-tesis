const express = require('express');

let app = express();

let Competicion = require('../Models/Competicion');
let Participantes = require('../Models/participantes');
let Profesionales = require('../Models/profesionales');
let Precio = require('../Models/precios');
let Torneo = require('../Models/torneo');
let { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');


//====================================
//Crear nueva competicion al participante
//====================================
app.post('/competicion', verificaToken, (req, res) => {
    let body = req.body;

    let id = body.participante;
    let subCategoria = body.subCategoria;
    let especialidad = body.especialidad;
    let divisional = body.divisional;
    let categoria = body.categoria;


    let valida = 0;

    //==================
    // FUNCION PARA VALIDAR REGLAS DE NEGOCIO
    //==================

    if (subCategoria === undefined) {
        subCategoria = 'EDAD'
    }

    valida = validacion(valida);
    console.log(`Resultado de la funcion validacion: ${valida}`);

    //==================
    // FUNCION PARA CARGAR EL PRECIO DEPENDIENDO LA ESPECIALIDAD
    //==================
    Precio.findOne({ descripcion: `${especialidad}` })
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

            let monto = precioDB.precio;

            // console.log(monto);

            let competicion = new Competicion({
                especialidad: body.especialidad,
                divisional: body.divisional,
                categoria: body.categoria,
                subCategoria: body.subCategoria,
                participante: body.participante,
                precio: monto
            });

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


                                //==================
                                // Busco cuantas competiciones tiene y guardo sus monto a pagar
                                //==================

                                Competicion.find({ participante: idParticipante }).exec((err, competicion) => {
                                    if (err) {
                                        console.log(err);
                                    }

                                    if (!competicion) {
                                        console.log('El participoante no tiene competencia');
                                    }

                                    let arreglo = [];
                                    let valor = 0;
                                    for (let i = 0; i < competicion.length; i++) {

                                        valor = competicion[i].precio
                                        arreglo.push(valor);

                                    }
                                    let total = 0;
                                    arreglo.forEach((a) => {
                                        total += a
                                    });

                                    console.log(`Total a pagar por Participante: ${total}`);

                                    console.log(`Precio de la competencia ${monto}`);

                                    //==================
                                    // Acumulo el monto a pagar total por participante
                                    //==================
                                    Participantes.findByIdAndUpdate({ _id: idParticipante }, { $set: { total: `${total}` } }, (err, participantesDB) => {

                                        if (err) {
                                            console.log(err)
                                        }

                                        if (!participantesDB) {
                                            return res.status(400).json({
                                                ok: false,
                                                message: 'EL participante no existe no se puede cargar el monto'
                                            });
                                        }

                                        console.log(`Se actualizo el participante id ${idParticipante} con el monto a pagar de ${total}`);


                                    }); //Acumulo el monto a pagar total por participante


                                    //==================
                                    // Agrego el monto total al profesional sumado a lo monto que tiene 
                                    //==================

                                    let Idprofesional = participanteDB.profesionales;

                                    console.log('Profesional: ' + Idprofesional);

                                    Profesionales.findById(`${Idprofesional}`).exec((err, profesional) => {
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

                                        console.log('Total a pagar Profesional: ' + profesional.total + ' Con el ID: ' + Idprofesional);

                                        let totalProfesional = profesional.total + monto;

                                        Profesionales.findByIdAndUpdate({ _id: Idprofesional }, { $set: { total: `${totalProfesional}` } }, (err, profesionalesDB) => {
                                            if (err) {
                                                console.log(err)
                                            }

                                            if (!profesionalesDB) {
                                                return res.status(400).json({
                                                    ok: false,
                                                    message: 'El profesional no existe no se puede cargar el monto'
                                                });
                                            }

                                            console.log(`Se actualizo el profesional id ${Idprofesional} con el monto a pagar de ${totalProfesional}`);
                                        }); //Fin findByIdAndUpdate Profesionales

                                    }); //Fin FIND Profesionales


                                    //==================
                                    // Agrego el monto total al total sumado a lo monto que tiene por cada profesional
                                    //==================

                                    console.log('-------------------------------------------');
                                    console.log('ID PROFESIONAL A BUSCAR: ' + Idprofesional);
                                    console.log('-------------------------------------------');
                                    Profesionales.find({ _id: Idprofesional }).exec((err, profesionalDB) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        if (!profesionalDB) {
                                            return res.status(400).json({
                                                ok: false,
                                                message: 'El profesional no existe no se puede cargar monto'
                                            })
                                        }

                                        let idTorneo = profesionalDB[0].torneo;
                                        console.log('************************************************');
                                        console.log(`El id del torneo del profesional es: ${idTorneo}`);
                                        console.log('************************************************');




                                        Torneo.findById(idTorneo).exec((err, torneoDB) => {

                                            if (err) {
                                                console.log(err)
                                            }

                                            if (!torneoDB) {
                                                return console.log('El Toreno no existe');
                                            }

                                            let MontoTorneo = torneoDB.total;

                                            console.log(MontoTorneo);


                                            let cargaTorneo = MontoTorneo + monto

                                            console.log('Carga para actualizar el torneo ' + cargaTorneo);



                                            Torneo.findByIdAndUpdate({ _id: idTorneo }, { $set: { total: `${cargaTorneo}` } }, (err, torneoDB) => {
                                                if (err) {
                                                    console.log(err)
                                                }

                                                if (!torneoDB) {
                                                    return console.log('El Toreno no existe');
                                                }

                                                console.log(`Se actualizo el torneo id ${idTorneo} con el monto recadudado de ${cargaTorneo}`);
                                            }); //Torneo.findByIdAndUpdate

                                        }); //Torneo.findById

                                    }); //Profesionales.find

                                }); //Busco cuantas competiciones tiene y guardo sus monto a pagar

                            }); //findOne participante la edad

                    }); //Busco cuantas competiciones tiene y guardo sus monto a pagar

                }); //save Competicion

                // }); //busco si el participante que envian es valido
            } else {
                res.status(412).json({
                    ok: false,
                    message: 'La asignacion de la competicion no corresponde a las reglas de negocio'

                });
            };
        });
});

//======================
// Modificar Competicion
//======================

app.put('/competicion/:id', verificaToken, (req, res) => {

    /*
        especialidad
        divisional
        categoria
        subCategoria
        participante
    */

    let id = req.params.id;
    let body = req.body;

    Competicion.findById(id).exec((err, competicionDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        if (!competicionDB) {
            return res.status(400).json({
                ok: false,
                message: 'la competicion no existe'
            });
        }

        update = {
            divisional: body.divisional,
            categoria: body.categoria,
            subCategoria: body.subCategoria
        }

        let divisional = competicionDB.divisional;
        let categoria = competicionDB.categoria;
        let subCategoria = competicionDB.subCategoria;
        let especialidad = competicionDB.especialidad;

        console.log('**********************************');
        console.log(`Valor de especialidad ${especialidad}`);
        console.log('**********************************');

        let divisional_mod = '';
        let categoria_mod = '';
        let subCategoria_mod = '';

        if (divisional !== update.divisional) {
            divisional_mod = update.divisional
        }

        if (update.divisional === undefined) {
            divisional_mod = divisional
        };

        if (categoria !== update.categoria) {
            categoria_mod = update.categoria
        }

        if (update.categoria === undefined) {
            categoria_mod = categoria
        };

        if (subCategoria !== update.subCategoria) {
            subCategoria_mod = update.subCategoria
        }

        if (update.subCategoria === undefined) {
            subCategoria_mod = subCategoria
        };


        console.log(divisional_mod);
        console.log(categoria_mod);
        console.log(subCategoria_mod);

        insert = {
            divisional: divisional_mod,
            categoria: categoria_mod,
            subCategoria: subCategoria_mod,
        }

        let valida = 1;

        //valida = validacion(valida);

        if (valida !== 0) {

            Competicion.findByIdAndUpdate(id, insert, (err, competicionDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if (!competicionDB) {
                    return res.status(400).json({
                        ok: false,
                        message: 'El participante no existe'
                    });
                }

                Competicion.findById(id).exec((err, competicionDB) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    res.json({
                        ok: true,
                        competicion: competicionDB
                    });

                }); //Competicion.findById

            }); //Competicion.findByIdAndUpdate

        }
    }); //Competicion.findById(id) Busco si la competicion existe
});


//==================
// Eliminar Competicion
//==================

app.delete('/competicion/:id', [verificaToken, verificaAdminRol], (req, res) => {

    let id = req.params.id;


    Competicion.findById(id, (err, competicionDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        if (!competicionDB) {
            return res.status(400).json({
                ok: false,
                message: 'La competicion no existe'
            })
        }

        let montoComp = competicionDB.precio;

        console.log(`montoComp Variable que muestra el precio de la competicion a Eliminar ${montoComp}`);

        let partComp = competicionDB.participante;

        console.log(`partComp Variable que muestra el id del participante asociado  ${partComp}`);

        Participantes.findById(partComp, (err, participanteDB) => {

            let montoParticipante = participanteDB.total;

            console.log(`montoParticipante Variable que muestra el monto cargado del participante  ${montoParticipante}`);

            let profeParticipante = participanteDB.profesionales._id;

            console.log(`profeParticipante Variable que muestra el id del profesional asociado al participante ${profeParticipante}`);


            Profesionales.findById(profeParticipante, (err, profesionalDB) => {

                let montoProfesional = profesionalDB.total;

                console.log(`montoProfesional Variable que muestra el monto del profesional ${montoProfesional}`);

                let torneoProfesional = profesionalDB.torneo._id;

                console.log(`torneoProfesional Variable que id del torneo asociado al profesional ${torneoProfesional}`);

                Torneo.findById(torneoProfesional, (err, torneoDB) => {

                    let montoTorneo = torneoDB.total;

                    console.log(`montoTorneo Variable que monto del torneo ${montoTorneo}`);


                    let updateTorneo = montoTorneo - montoComp;
                    let updateProf = montoProfesional - montoComp;
                    let updatePart = montoParticipante - montoComp;

                    console.log(`Monto del Torneo ${updateTorneo}`);
                    console.log(`Monto del Profesional ${updateProf}`);
                    console.log(`Monto del Participante ${updatePart}`);


                    Participantes.findByIdAndUpdate(partComp, { total: updatePart }, (err, participanteDB) => {

                        Profesionales.findByIdAndUpdate(profeParticipante, { total: updateProf }, (err, participanteDB) => {

                            Torneo.findByIdAndUpdate(torneoProfesional, { total: updateTorneo }, (err, torneoDB) => {

                                Competicion.remove({ "_id": id }, (err, competicionDB) => {
                                    if (err) {
                                        return res.status(500).json({
                                            ok: false,
                                            message: err
                                        })
                                    }

                                    res.json({
                                        ok: true,
                                        message: 'Se borro de forma correcta la competicion'
                                    })
                                });

                            });
                        });

                    });

                });

            });

        });

    });

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

function validacion(valida) {
    if (especialidad === 'ESCUELA') {
        if (divisional === 'C' || divisional === 'B' || divisional === 'A') {

            if (divisional === 'C') {
                if (categoria === 'FORMATIVA' || categoria === '5' || categoria === '4' || categoria === '3' || categoria === '2' || categoria === '1') {

                    if (subCategoria !== 'TOTS' || subCategoria !== 'PRE-MINI' || subCategoria !== 'MINI-INFANTIL' || subCategoria !== 'INFANTIL' || subCategoria !== 'CADETE' || subCategoria !== 'JUVENIL' || subCategoria !== 'JUNIOR' || subCategoria !== 'SENIOR') {

                        if (subCategoria === 'EDAD') {

                            return valida = 1;

                        }

                    }

                }
            }
            if (divisional === 'B') {
                if (categoria === 'PROMOCIONAL' || categoria === '5' || categoria === '4' || categoria === '3' || categoria === '2' || categoria === '1') {

                    if (subCategoria !== 'TOTS' || subCategoria !== 'PRE-MINI' || subCategoria !== 'MINI-INFANTIL' || subCategoria !== 'INFANTIL' || subCategoria !== 'CADETE' || subCategoria !== 'JUVENIL' || subCategoria !== 'JUNIOR' || subCategoria !== 'SENIOR') {
                        if (subCategoria === 'EDAD') {

                            return valida = 1;

                        }
                    }
                }
            }
            if (divisional === 'A') {
                if (categoria === 'NACIONAL' || categoria === 'NACIONAL-ELITE') {

                    //'TOTS', 'PRE-MINI', 'MINI-INFANTIL', 'INFANTIL', 'CADETE', 'JUVENIL', 'JUNIOR', 'SENIOR', 'EDAD'
                    if (categoria === 'NACIONAL') {
                        if (subCategoria === 'TOTS' || subCategoria === 'PRE-MINI' || subCategoria === 'MINI-INFANTIL' || subCategoria === 'INFANTIL' || subCategoria === 'CADETE' || subCategoria === 'JUVENIL' || subCategoria === 'JUNIOR' || subCategoria === 'SENIOR') {
                            return valida = 1;
                        }
                    }
                    if (categoria === 'NACIONAL-ELITE') {

                        if (subCategoria === 'CADETE' || subCategoria === 'JUVENIL' || subCategoria === 'JUNIOR' || subCategoria === 'SENIOR') {
                            return valida = 1;
                        }
                    }
                }
            }
        }
    }
    if (especialidad === 'LIBRE') {
        if (divisional === 'C' || divisional === 'B' || divisional === 'A' || divisional === 'D') {

            if (divisional === 'C') {
                if (categoria === 'FORMATIVA' || categoria === '5' || categoria === '4' || categoria === '3' || categoria === '2' || categoria === '1') {

                    if (subCategoria !== 'TOTS' || subCategoria !== 'PRE-MINI' || subCategoria !== 'MINI-INFANTIL' || subCategoria !== 'INFANTIL' || subCategoria !== 'CADETE' || subCategoria !== 'JUVENIL' || subCategoria !== 'JUNIOR' || subCategoria !== 'SENIOR') {

                        if (subCategoria === 'EDAD') {

                            return valida = 2;

                        }

                    }

                }
            }
            if (divisional === 'B') {
                if (categoria === 'PROMOCIONAL' || categoria === '5' || categoria === '4' || categoria === '3' || categoria === '2' || categoria === '1') {

                    if (subCategoria !== 'TOTS' || subCategoria !== 'PRE-MINI' || subCategoria !== 'MINI-INFANTIL' || subCategoria !== 'INFANTIL' || subCategoria !== 'CADETE' || subCategoria !== 'JUVENIL' || subCategoria !== 'JUNIOR' || subCategoria !== 'SENIOR') {
                        if (subCategoria === 'EDAD') {

                            return valida = 2;

                        }
                    }
                }
            }
            if (divisional === 'A') {
                if (categoria === 'NACIONAL' || categoria === 'NACIONAL-ELITE') {

                    //'TOTS', 'PRE-MINI', 'MINI-INFANTIL', 'INFANTIL', 'CADETE', 'JUVENIL', 'JUNIOR', 'SENIOR', 'EDAD'
                    if (categoria === 'NACIONAL') {
                        if (subCategoria === 'TOTS' || subCategoria === 'PRE-MINI' || subCategoria === 'MINI-INFANTIL' || subCategoria === 'INFANTIL' || subCategoria === 'CADETE' || subCategoria === 'JUVENIL' || subCategoria === 'JUNIOR' || subCategoria === 'SENIOR') {
                            return valida = 2;
                        }
                    }
                    if (categoria === 'NACIONAL-ELITE') {

                        if (subCategoria === 'CADETE' || subCategoria === 'JUVENIL' || subCategoria === 'JUNIOR' || subCategoria === 'SENIOR') {
                            return valida = 2;
                        }
                    }
                }
            }

            if (divisional === 'D') {

                if (categoria === 'INICIACION' || categoria === 'AVANZADO') {

                    if (subCategoria === 'EDAD') {

                        return valida = 2;

                    }

                }

            }

        }
    }
    return valida;
} //fin de funcion validacion

module.exports = app;
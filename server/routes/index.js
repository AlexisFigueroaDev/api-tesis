const express = require('express');
const app = express();

app.use(require('./torneo'));
app.use(require('./profesionales'));
app.use(require('./participantes'));
app.use(require('./competicion'));
app.use(require('./precios'));
app.use(require('./usuarios'));
app.use(require('./login'));



module.exports = app;
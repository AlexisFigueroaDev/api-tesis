const express = require('express');
const app = express();

app.use(require('./torneo'));
app.use(require('./profesionales'));
app.use(require('./participantes'));
app.use(require('./competicion'));
app.use(require('./precios'));

module.exports = app;
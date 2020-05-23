const express = require('express');
const app = express();

app.use(require('./torneo'));
app.use(require('./profesionales'));


module.exports = app;
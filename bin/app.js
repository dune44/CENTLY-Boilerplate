const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.set('x-powered-by',false);
app.use(bodyParser.json());

require('./router')(app);

module.exports = app;
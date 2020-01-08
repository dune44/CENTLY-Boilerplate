const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = experss();
app.set('x-powered-by',false);
app.use(bodyParser.json());

require('./router')(app);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

module.exports = app;
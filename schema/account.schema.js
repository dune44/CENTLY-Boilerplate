const async = require('wrap-sync');
const osom = require('osom');
const validator = require('validator');

/*
    Model for User login
    Put secret as a placeholder for possible future security feature.
    enable2a qruri for Qr code URI 2 stage authentication
*/
const trim = (str) => str.trim();
const tlc = (str) => str.toLowerCase();
const validatePassword = (value) => (value.length > 30);
const validateEmail = (value) => (validator.isEmail(value));

const globalFields = {
    transform: [trim]
};

const accountSchema = {
    _id: {
        required: true,
        type: String
    },
    _type: {
        _type: 'account',
        type: String
    },
    username: {
        required: true,
        transform: [trim],
        type: String
    },
    password: {
        required: true,
        transform: [trim],
        validate: validatePassword,
        type: String
    },
    email: {
        required: true,
        transform: [tlc,trim],
        type: String,
        validate: validateEmail
    },
    enable2a: {
     type: Boolean
    },
    secret: {
        type: String
    },
    qruri:{
        type: String
    },
    roles: {
        type: Array
    },
    blocked: {
        default: false,
        type: Boolean
    },
    deleted: {
        default: false,
        type: Boolean
    },
    token: {
        type: Array
    },
    date: {
        type: Object
    }
};

const dateSchema = {
    origin: {
        type: Date
    },
    updated: {
        type: Date,
        default: Date.now
    }
};

// User IP addresses upon login, to be added to the token object.
const ipsSchema = {
    ip:{
        type: String
    },
    fwdip: {
        type: String
    }
};

// JWT token store, this will be an array in the database.
const tokenSchema = {
    token: {
        required: true,
        type: String
    }
};
const methods = {
    account: (value) => osom(accountSchema)(value),
    date: (value) => osom(dateSchema)(value),
    ips: (value) => osom(ipsSchema)(value),
    token: (value) => osom(tokenSchema)(value)
};
module.exports = methods;

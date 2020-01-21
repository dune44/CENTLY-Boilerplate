const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const osom = require('osom');
/*
    Model for User login
    Put secret as a placeholder for possible future security feature.
    enable2a qruri for Qr code URI 2 stage authentication
*/
const trim = (str) => str.trim();
const globalFields = {
    transform: [trim]
};

const schema = {
    _id: {
        type: String
    },
    _type: {
        type: String
    },
    username: {
        required: true,
        transform: [],
        type: String,
        unique: true
    },
    password: {
        minlength: 30,
        required: true,
        transform: [],
        type: String,
        validate(value) {
            if(value.toLowerCase().includes('password') ||
            value.includes('1234')){
                throw new Error('Password too simple');
            }
        }
    },
    email: {
        lowercase: true,
        trim: true,
        transform: [],
        type: String,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid email entered');
            }
        }
    },
    date: {
        origin: Date,
        update: {
            type: Date,
            default: Date.now
        }
    },
    enable2a: Boolean,
    secret: String,
    qruri: String,
    roles: [String],
    blocked: {
        default: false,
        type: Boolean
    },
    deleted: {
        default: false,
        type: Boolean
    },
    tokens: [{
        token: {
            required: true,
            type: String
        },
        ips: {
            ip: String,
            fwdip: String
        }
    }]
};

const aSchema = osom(schema,globalFields);
module.exports = {
    "async": async.asyncify(aSchema),
    "sync": aSchema
};
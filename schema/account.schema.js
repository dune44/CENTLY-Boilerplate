const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/*

*/

const accountSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        type: String,
        minlength: 30
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
        type: Boolean,
        default: false
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
});

// TODO: Pre Validation


// TODO: Generate Token


// TODO: Compare Password for login


const Account = mongoose.model('Account', accountSchema);


const async = require('wrap-sync');
const osom = require('osom');
const { v4: uuidv4 } = require('uuid');

/*
    Model for User login
    I have put secret as a placeholder for possible future security feature.
    enable2a qruri for Qr code URI 2 stage authentication
*/
const trim = ( str ) => str.trim();
const tlc = ( str ) => str.toLowerCase();
const validateUsername = ( value ) => ( value.length > 2 );
const validatePassword = ( value ) => ( value.length > 30 );

const accountSchema = {
    _id: {
      default: uuidv4(),
      required: true,
      type: String
    },
    _type: {
      default: 'account',
      required: true,
      type: String
    },
    username: {
      required: true,
      transform: [trim],
      validate: validateUsername,
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
      type: String
    },
    enable2a: {
      type: Boolean
    },
    secret: {
      type: String
    },
    qrUri:{
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
    },
    recoveryPhrase: {
      type: String
    },
    recoveryPhraseProved: {
      type: Boolean
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

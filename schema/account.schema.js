const validator = require('validator');
const osom = require('osom');
/*
    Model for User login
    Put secret as a placeholder for possible future security feature.
    enable2a qruri for Qr code URI 2 stage authentication
*/
const trim = (str) => str.trim();
const tlc = (str) => str.toLowerCase();
const validatePassword = (value) => (value.length < 30)
const validateEmail = (value) => {
    if(!validator.isEmail(value)){
        throw new Error('Invalid email entered');
    }
};
const globalFields = {
    transform: [trim]
};

const accountSchema = {
    _id: {
        type: String
    },
    _type: {
        type: String
    },
    username: {
        required: true,
        transform: [],
        type: String
    },
    password: {
        required: true,
        transform: [],
        validate: validatePassword,
        type: String
    },
    email: {
        transform: [tlc],
        type: String,
        validate: validateEmail
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
    }
};

const dateSchema = {
    origin: {
        type: Date
    },
    update: {
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

const accountOsom = osom(accountSchema,globalFields);
const dateOsom = osom(dateSchema);
const ipsOsom = osom(ipsSchema);
const tokenOsom = osom(tokenSchema);


module.exports = {
    account: {
        "async": async.asyncify(accountOsom),
        "sync": accountOsom
    },
    date: {
        "async": async.asyncify(dateOsom),
        "sync": dateOsom
    },
    ips: {
        "async": async.asyncify(ipsOsom),
        "sync": ipsOsom
    },
    token: {
        "async": async.asyncify(tokenOsom),
        "sync": tokenOsom
    }
};
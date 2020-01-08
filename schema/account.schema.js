const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
/*
    Model for User login
    Put secret as a placeholder for possible future security feature.
    enable2a qruri for Qr code URI 2 stage authentication
*/

const accountSchema = new mongoose.Schema({
    username: {
        required: true,
        trim: true,
        type: String,
        unique: true
    },
    password: {
        minlength: 30,
        required: true,
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
});

// Make sure password is hashed before saving to db.
accountSchema.pre('validate', async function(next) {
    let account = this;
    if (account.isModified('password')){
        account.password = await bcrypt.hash(account.password, 8);
    }
    next();
});

// Generate JWT Token and save
accountSchema.methods.generateToken = async function (ips) {
    const account = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, '7 days' );

    // add token to account with their current ip.
    // add a forwarded IP to check if user has a proxy.
    account.tokens = account.tokens.concat({
        token: token,
        ips: {
            ip:ips.ip,
            fwdIP: ips.fwdIP
        }
    });

    await account.save();

    return token;
}

// Compare Password for login
accountSchema.statics.comparePassword = async function(username, password) {
    const account = await Account.findOne({ username: username });
    
    if (!account) {
        throw new Error('Account not found');
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
        throw new Error('Invalid login credentials');
    }

    return account
};

const Account = mongoose.model('Account', accountSchema);


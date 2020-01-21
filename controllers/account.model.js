const accountSchema = require('./../schema/account.schema');
const db = require('./db');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
var collection = db.collection(process.env.BUCKET);

const accountModel = {
    Create: {
        account: (account) => {

        }
    },
    Read: {
        accountById: (uid) => {

        },
        accountByUsername: (username) => {

        },
        all: () => {

        },
        rolesById: (uid) => {

        },
        isInRole: (uid,role) => {

        },
        validateAccount: (account) => {
            let account = this;
            if (account.isModified('password')){
                account.password = await bcrypt.hash(account.password, 8);
            }
            next();
        }
    },
    Update: {
        account: () => {

        },
        password: () => {

        },
        role: () => {

        },
        token: async (account, ips) => {
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
        
            await collection.Update({_id: account._id},account);
        
            return token;
        },
        twoStep: () => {

        }
    },
    Delete: {
        account: () => {

        }
    }
};
const accountMethod = {
    checkForDupicatAccount: () => {

    }
}
module.exports = accountModel;

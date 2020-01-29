const accountSchema = require('./../schema/account.schema');
const bcrypt = require('bcryptjs');
const couchbase = require('couchbase');
const db = require('./db');
const moment = require('moment');
const N1qlQuery = couchbase.N1qlQuery;
const speakeasy = require('speakeasy');
const uuidv4 = require('uuid/v4');
const QRCode = require('qrcode');
//const collection = db.collection(process.env.BUCKET);
// console.log(N1qlQuery);
const accountModel = {
    Create: {
        account: (account, next) => {
            if(!accountMethod.disallowedName(account.username)){
                accountMethod.duplicateName(account.username, (duplicate) => {
                    if(!duplicate){
                        account._id = uuidv4();
                        accountMethod.ink(account.password, (hash) => {
                            account.password = hash;
                            console.log('validating account with osom.');
                            const validatedAccount = accountSchema.account(account);
                            console.log('insert data into couchbase.');
                            db.insert('account|'+validatedAccount._id,validatedAccount, (e,r,m) => {
                                if(e){
                                    console.log('Error insert account.');
                                    console.log(e);
                                    next({ "msg": "An error occured. Account not created."});
                                } else {
                                    console.log('result');
                                    console.log(r);
                                    next( validatedAccount );
                                }
                            });
                        });
                    }else{
                        const msg = 'Username already in use.';
                        console.log(msg);
                        next({ "msg": msg });
                    }
                });
            }else{
                const msg = 'Username is not allowed.';
                console.log(msg);
                next({ "msg": msg });
            }
        }
    },
    Read: {
        accountById: (uid) => {
            const q = N1qlQuery.fromString('SELECT * FROM `'+process.env.BUCKET+'` WHERE _id=$1');
            db.query(q, [uid], (e, r) => {
                if(e){
                    console.log('error in accountModel.Read.accountById')
                    console.log(e);
                    next(false);
                }else{
                    next ( (r.length === 1) ? (r[0]) : false );
                }
            });
        },
        accountByUsername: (username) => {

        },
        all: () => {

        },
        rolesById: (uid) => {

        },
        isInRole: (uid,role) => {

        },
        validateAccount: async (account) => {
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
    duplicateName: (username, next) => {
        const q = N1qlQuery.fromString('SELECT * FROM `'+process.env.BUCKET+'` WHERE `username`=$1');
        db.query(q, [username], (e, r) => {
            if(e){
                console.log('error in accountMethod.duplicateName')
                console.log(e);
                next(true);
            }else{
                console.log('username duplicate: ' + (r.length > 0));
                next( (r.length > 0) );
            }
        });
    },
    disallowedName: ( username ) => {
        const nameList =[
            "admin",
            "administrater",
            "username"
        ];
        return ( nameList.indexOf( username ) > -1 );
    },
    ink: ( password, done ) => {
        bcrypt.genSalt( 5, function( e, salt ) {
          if( e ) console.error( e );
          bcrypt.hash( password, salt, function( er, hash ) {
            if( er ) {
              console.error(er);
            }else{
              done( hash );
            }
          });
        });
    }
}
module.exports = accountModel;
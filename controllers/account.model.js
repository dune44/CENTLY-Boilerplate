//const accountSchema = require('./../schema/account.schema');
const bcrypt = require('bcryptjs');
const couchbase = require('couchbase');
const db = require('./db');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const N1qlQuery = couchbase.N1qlQuery;
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const roles = require('./../config/roles');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');

const fields = '_id, _type, `blocked`, `deleted`, `email`, `username`';
const noAccountMSG = 'Account not found.';
// Test to make sure newer couchbase have flushed api.
//const collection = db.collection(process.env.BUCKET);
// console.log(N1qlQuery);

const accountModel = {
    Create: {
        account: ( account, next ) => {
            if( !accountMethod.disallowedName( account.username ) ) {
                accountMethod.duplicateName( account.username, ( duplicate ) => {
                    if( !duplicate ) {
                        accountMethod.ink(account.password, ( hash, inkmsg ) => {
                            if( hash ) {
                                const validModel = accountMethod.preValidateModel( account );
                                if( validModel.result ) {
                                    account = validModel.account;
                                    account.password = hash;
                                    db.insert('account|'+account._id,account, function( e, r ) {
                                        if(e){
                                            console.log( 'Error: inserting account' );
                                            console.log( e );
                                            next({ "msg": "An error occured. Account not created.", "error": e, "result": false });
                                        } else {
                                            next({ "data": account, "result": true });
                                        }
                                    });
                                } else {
                                    next({ "msg": validModel.msg, "result": false});
                                }
                            } else {
                                next({ "msg": inkmsg, "result": false });
                            }

                        });
                    }else{
                        const msg = 'Username already in use.';
                        next({ "msg": msg, "result": false });
                    }
                });
            }else{
                const msg = 'Username is not allowed.';
                next({ "msg": msg, "result": false });
            }
        }
    },
    Read: {
        accountById: ( uid, next ) => {
            const q = N1qlQuery.fromString('SELECT ' +  fields + ' FROM `'+process.env.BUCKET+'` WHERE _type == "account" AND _id == "' + uid + '" ');
            db.query(q, (e, r) => {
                if(e){
                    console.log('error in accountModel.Read.accountById');
                    console.log(e);
                    next({ "msg": e, "result": false});
                }else{
                    if( r.length === 1 ) {
                        next({ "data": r[0], "result": true });
                    } else if( r.length === 0 ) {
                        next({ "msg": 'no user found.', "result": false });
                    } else {
                        next({ "msg": 'Unexpected result', "result": false });
                    }
                }
            });
        },
        accountByUsername: ( username, next ) => {
            const q = N1qlQuery.fromString('SELECT '+fields+' FROM `'+process.env.BUCKET+'` WHERE _type == "account" AND `username` == "' + username + '"');
            db.query(q, function(e, r) {
                if(e){
                    console.log('error in accountModel.Read.accountByUsername');
                    console.log(e);
                    next({ "error": e, "msg": 'An error occured', "result": false });
                }else{
                    if ( r.length === 1 ) {
                        next({ "data": r[0], "result": true });
                    } else if (r.length === 0) {
                        const msg = 'Result not found for ' + username;
                        next({ "msg": msg, "result": false });
                    } else {
                        const msg = 'There is a duplicate found for ' + username;
                        next({ "msg": msg, "result": false });
                    }

                }
            });
        },
        all: ( next ) => {
          const q = N1qlQuery.fromString('SELECT '+fields+' FROM `'+process.env.BUCKET+'` WHERE _type == "account" ');
          db.query(q, function(e, r) {
              if(e){
                  console.log('error in accountModel.Read.all');
                  console.log(e);
                  next({ "error": e, "msg": 'An error occured', "result": false });
              }else{
                  if ( r.length > 0 ) {
                      next({ "data": r, "result": true });
                  } else {
                      const msg = 'There are no results found ';
                      next({ "msg": msg, "result": false });
                  }
              }
          });
        },
        rolesById: ( uid, next)  => {
            const q = N1qlQuery.fromString('SELECT _id, `roles` FROM `'+process.env.BUCKET+'` WHERE _type == "account" AND _id == "' + uid + '" ');
            db.query(q, (e, r) => {
                if(e){
                    console.log('error in accountModel.Read.accountById');
                    console.log(e);
                    next({ "msg": e, "result": false});
                }else{
                    if( r.length === 1 ) {
                        const roles = ( r[0].roles ) ? r[0].roles : [] ;
                        next({ "data": roles, "result": true });
                    } else if( r.length === 0 ) {
                        next({ "msg": noAccountMSG, "result": false });
                    } else {
                        next({ "msg": 'Unexpected result', "result": false });
                    }
                }
            });
        },
        isInRole: ( uid, role, next ) => {
            if( accountMethod.roleExists( role ) ) {
                const q = N1qlQuery.fromString('SELECT `roles` FROM `'+process.env.BUCKET+'` WHERE _type == "account" AND _id == "' + uid + '" ');
                db.query(q, (e, r) => {
                    if(e){
                        console.log('error in accountModel.Read.accountById');
                        console.log(e);
                        next({ "msg": e, "result": false});
                    }else{
                        if( r.length === 1 ) {
                            const roles = ( r[0].roles ) ? r[0].roles : [] ;
                            const result = roles.includes(role);
                            next({ "result": result });
                        } else if( r.length === 0 ) {
                            next({ "msg": noAccountMSG, "result": false });
                        } else {
                            next({ "msg": 'Unexpected result', "result": false });
                        }
                    }
                });
            } else {
                next({ "msg": 'No such role.', "result": false });
            }
        },
        validateAccount: ( account, next ) => {
          const validationerrmsg = 'Account validation failed.';
          const q = N1qlQuery.fromString('SELECT ' + fields + ', `password` FROM `'+process.env.BUCKET+'` WHERE _type == "account" AND `username` == "' + account.username + '"');
          db.query(q, function(e, r) {
            if(e){
              console.log('error in accountModel.Read.validateAccount');
              console.log(e);
              next({ "error": e, "msg": 'An error occured', "result": false });
            }else{
              if ( r.length === 1 ) {
                    accountMethod.passwordCompare( account.password, r[0].password, ( result ) => {
                      if( result ){
                        accountModel.Update.token( r[0]._id, account, ( tokens ) => {
                          next({ "result": result, "token": tokens.token });
                        });
                      } else {
                        next({ "msg": validationerrmsg, "result": false });
                      }
                    });
              } else if( r.length === 0 ) {
                next({ "msg": validationerrmsg, "result": false });
              } else {
                console.log('unexpected length of ' + r.length);
                next({ "msg": "data length unexpected.", "result": false });
              }
            }
          });
        },
        verifyToken: ( token, next ) => {
          jwt.verify(token, process.env.JWT_SECRET, ( e, decoded ) => {
            if( e ) {
              console.log('error in accountModel.Read.verifyToken');
              console.log(e);
              next({ "error": e, "msg": 'An error occured', "result": false });
            } else if(moment().unix() > decoded.exp ){
              // time expired.
              next({ result: false });
            } else {
              // there is time left
              const timeLeft = moment.unix( decoded.exp ).fromNow();
              next({ "result": true, "expiresIn": timeLeft });
            }
          });
        }
    },
    Update: {
        account: ( uid, account, next ) => {

            next();

        },
        password: ( uid, oldPassword, newPassword, next ) => {
            
            next();

        },
        role: ( uid, role, next ) => {
            if( accountMethod.roleExists( role ) ) {
                accountModel.Read.accountById( uid, ( acct ) => {
                    if( acct.result ) {
                        if( acct.data.roles ) acct.data.roles.push(role);
                        else acct.data.roles = [ role ];

                        const q = N1qlQuery.fromString('UPDATE `'+process.env.BUCKET+'` SET roles = ' + JSON.stringify( acct.data.roles ) + ' WHERE _type == "account" AND _id == "' + uid + '" ');
                        db.query(q, function(e, r, m) {
                            if(e){
                                console.log('error in accountModel.Update.role');
                                console.log(e);
                                next({ "error": e, "msg": 'An error occured', "result": false });
                            }else{
                                if( m.status == 'success' && m.metrics.mutationCount == 1 )
                                    next({ "result": true });
                                else
                                    next({ "msg": 'Not a successful update.', "result": false });
                            }
                        });

                    } else {
                        next({ "msg": 'No such user.', "result": false });
                    }
                });
            } else {
                next({ "msg": 'No such role.', "result": false });
            }
        },
        // TODO move to methods
        token: ( uid, account, next ) => {
          const token = jwt.sign({ _id: uid }, process.env.JWT_SECRET, { expiresIn: '7 days' } );

          // add token to account with their current ip.
          // add a forwarded IP to check if user has a proxy.
          let tokens = {
            token: token,
              ips: {
                ip: account.ips.ip,
                fwdIP: account.ips.fwdIP
              }
          };

          // collection.Update({_id: account._id},account);
          next( tokens );
        },
        twoStep: ( next ) => {

            next();

        }
    },
    Delete: {
        account: ( uid, password, next) => {

            next();

        }
    }
};
const accountMethod = {
    duplicateName: ( username, next ) => {
      accountModel.Read.accountByUsername( username, ( r ) => {
        next( r.result );
      });
    },
    disallowedName: ( username ) => {
        const nameList =[
            "admin",
            "administrator",
            "username"
        ];
        return ( nameList.indexOf( username ) > -1 );
    },
    ink: ( password, done ) => {
        bcrypt.genSalt( 5, function( e, salt ) {
            if( e ) console.error( e );
            bcrypt.hash( password, salt, function( er, hash ) {
                if( er ) {
                    console.error( er );
                }else{
                    done( hash, null );
                }
            });
        });
    },
    passwordCompare: ( pwd, hash, done ) => {
      bcrypt.compare( pwd, hash, function( e, r ) {
        if( e ) {
          console.log(' Error accountMethod passwordCompare');
          console.log( e );
        } else {
          done( r );
        }
      });
    },
    preValidateModel: ( account ) => {
        let result = true, msg = '';
        if( !accountMethod.validateEmail( account.email ) ) {
            result = false;
            msg = ' Email is not valid. ';
        }
        if( !accountMethod.validatePassword( account.password ) ) {
            result = false;
            msg += ' Password is too short. ';
        }
        if( !accountMethod.validateUsername( account.username ) ) {
            result = false;
            msg += ' Username is too short. ';
        }
        account._id = uuidv4();
        account._type = 'account';
        account.blocked = false;
        account.deleted = false;
        return ({ result, msg, account });
    },
    roleExists: ( role, next ) => {
        return roles.includes(role);
    },
    validateEmail: ( email ) => validator.isEmail( email ),
    validatePassword: ( password ) => ( password.length >= 8 ),
    validateUsername: ( username ) => ( username.length >= 3 ),
};
module.exports = accountModel;

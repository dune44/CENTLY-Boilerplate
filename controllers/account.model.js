//const accountSchema = require('./../schema/account.schema');
const bcrypt = require( 'bcryptjs' );
const couchbase = require( 'couchbase' );
const db = require( './db' );
const jwt = require( 'jsonwebtoken' );
const moment = require( 'moment' );
const N1qlQuery = couchbase.N1qlQuery;
const speakeasy = require( 'speakeasy' );
const QRCode = require( 'qrcode' );
const roles = require( './../config/roles' );
const { v4: uuidv4 } = require( 'uuid' );
const validator = require( 'validator' );

const errMsg = require( './account.errMsg' );
const fields = '_id, _type, `blocked`, `deleted`, `email`, `username`';
// Test to make sure newer couchbase have flushed api.
//const collection = db.collection(process.env.BUCKET);
// console.log(N1qlQuery);

// TODO: Add undelete account fn
// TODO: ADD Regex to validatePassword
// TODO: Add bad Login and Recovery Phrase Count
// TODO: Reset password

const accountModel = {
    Create: {
      account: ( account, next ) => {
            if( !accountMethod.disallowedName( account.username ) ) {
                accountMethod.duplicateName( account.username, ( duplicate ) => {
                    if( !duplicate ) {
                        accountMethod.ink(account.password, ( hash, inkMsg ) => {
                            if( hash ) {
                                const validModel = accountMethod.preValidateModel( account );
                                if( validModel.result ) {
                                    account = validModel.account;
                                    account.password = hash;
                                    db.insert('account|'+account._id,account, function( e, r ) {
                                        if(e){
                                            console.log( 'Error: inserting account' );
                                            console.log( e );
                                            next({ "msg": "An error occurred. Account not created.", "error": e, "result": false });
                                        } else {
                                            next({ "data": account, "result": true });
                                        }
                                    });
                                } else {
                                    next({ "msg": validModel.msg, "result": false});
                                }
                            } else {
                                next({ "msg": inkMsg, "result": false });
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
            const q = N1qlQuery.fromString('SELECT ' +  fields + ' FROM `' + process.env.BUCKET +
            '` WHERE _type == "account" AND _id == "' + uid + '" AND `deleted` == false ');
            db.query(q, (e, r) => {
                if(e){
                    console.log('error in accountModel.Read.accountById');
                    console.log(e);
                    next({ "msg": e, "result": false});
                }else{
                    if( r.length === 1 ) {
                        next({ "data": r[0], "result": true });
                    } else if( r.length === 0 ) {
                        next({ "msg": errMsg.accountNotFound, "result": false });
                    } else {
                        next({ "msg": 'Unexpected result', "result": false });
                    }
                }
            });
        },
      accountByUsername: ( username, next ) => {
            const q = N1qlQuery.fromString('SELECT '+fields+' FROM `' + process.env.BUCKET +
            '` WHERE _type == "account" AND `username` == "' + username + '" AND `deleted` == false ');
            db.query(q, function(e, r) {
                if(e){
                    console.log('error in accountModel.Read.accountByUsername');
                    console.log(e);
                    next({ "error": e, "msg": 'An error occured', "result": false });
                }else{
                    if ( r.length === 1 ) {
                        next({ "data": r[0], "result": true });
                    } else if (r.length === 0) {
                        // const msg = 'Result not found for ' + username;
                        next({ "msg": errMsg.accountNotFound, "result": false });
                    } else {
                        const msg = 'There is a duplicate found for ' + username;
                        next({ "msg": msg, "result": false });
                    }

                }
            });
        },
      all: ( next ) => {
          const q = N1qlQuery.fromString('SELECT '+fields+' FROM `' + process.env.BUCKET +
          '` WHERE _type == "account" AND `deleted` == false ');
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
      passphrase: ( uid, next ) => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`!@#$%^&*-_.';
          let phrase = '';
          for (var i = 0; i < 32; i++) {
            phrase += chars.substr( Math.floor(Math.random() * chars.length), 1);
          }
          let q = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
          '` SET `recoveryPhrase` = $1 WHERE _type == "account" AND _id == "' +
          uid + '" AND `deleted` == false ');
          accountMethod.ink( phrase, ( hash, inkMsg ) => {
            db.query(q, [hash], function(e, r, m) {
              if(e){
                console.log('error in accountModel.Update.password');
                console.log(e);
                next({ "error": e, "msg": errMsg.errorMsg, "result": false });
              }else{
                if( m.status == 'success' && m.metrics.mutationCount == 1 )
                  next( phrase );
                else
                  next({ "msg": errMsg.updateGenericFail, "result": false });
              }
            });
          });
        },
      rolesById: ( uid, next)  => {
            const q = N1qlQuery.fromString('SELECT _id, `roles` FROM `' + process.env.BUCKET +
            '` WHERE _type == "account" AND _id == "' + uid + '" ');
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
                        next({ "msg": errMsg.accountNotFound, "result": false });
                    } else {
                        next({ "msg": 'Unexpected result', "result": false });
                    }
                }
            });
        },
      isInRole: ( uid, role, next ) => {
            if( accountMethod.roleExists( role ) ) {
                const q = N1qlQuery.fromString('SELECT `roles` FROM `' + process.env.BUCKET +
                '` WHERE _type == "account" AND _id == "' + uid + '" ');
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
                            next({ "msg": errMsg.accountNotFound, "result": false });
                        } else {
                            next({ "msg": 'Unexpected result', "result": false });
                        }
                    }
                });
            } else {
                next({ "msg": errMsg.roleInvalid, "result": false });
            }
        },
      validateAccount: ( username, password, ips, twoAtoken, next ) => {
        accountMethod.getAccountByUsername( username, true, ( account ) => {
          if( account.result ) {
            const twoAResult = ( account.data.enable2a ) ? accountMethod.validate2a( account.data.secret, twoAtoken ) : true;
            if( twoAResult ) {
              accountMethod.passwordCompare( password, account.data.password, ( result ) => {
                if( result ){
                  accountMethod.updateToken( account.data._id, ips, ( token ) => {
                    next({ "result": result, "token": token });
                  });
                } else {
                  next({ "msg": errMsg.accountValidationFailure, "result": false });
                }
              });
            } else {
              console.log( 'enable2a ' + account.data.enable2a );
              next({ "msg": errMsg.accountValidationFailure, "result": false });
            }
          } else {
            next( account );
          }
        });
      },
      verifyToken: ( token, next ) => {
          jwt.verify( token, process.env.JWT_SECRET, ( e, decoded ) => {
            if( e ) {
              console.log('error in accountModel.Read.verifyToken');
              console.log( e );
              console.log( );
              console.log( 'token passed: ' + token );
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
      email: ( uid, email, next ) => {
            if( email ) {
                if( !accountMethod.validateEmail( email ) ) {
                    next({ "msg": errMsg.emailInvalid, "result": false });
                } else {
                    const q = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
                    '` SET email = "' + email + '" WHERE _type == "account" AND _id == "' +
                    uid + '" AND `deleted` == false ');
                    db.query(q, function(e, r, m) {
                        if(e){
                            console.log('error in accountModel.Update.email');
                            console.log(e);
                            next({ "error": e, "msg": errMsg.errorMsg, "result": false });
                        }else{
                            if( m.status == 'success' && m.metrics.mutationCount == 1 )
                                next({ "result": true });
                            else {
                                if( r.length === 0 ) {
                                    next({ "msg": errMsg.accountNotFound, "result": false });
                                } else {
                                    next({ "msg": errMsg.updateGenericFail, "result": false });
                                }
                            }
                        }
                    });
                }
            } else {
                next({ "msg": 'Email cannot be blank', "result": false});
            }
        },
      generateQRcode: ( uid, next ) => {
          const secret = speakeasy.generateSecret();
          QRCode.toDataURL(secret.otpauth_url, function(e, data_url) {
            if( e ) {
              next({ "error": e, "result": false });
            } else{
              accountMethod.saveQR( uid, secret.base32, ( result ) => {
                if( result.result ) {
                  next({ "secret": secret, "data_url": data_url, "result": true });
                } else {
                  next( result );
                }
              });
            }
          });
        },
      passphraseProved: ( uid, phrase, next ) => {
          const qR = N1qlQuery.fromString('SELECT `recoveryPhrase` FROM `' + process.env.BUCKET +
          '` WHERE _type == "account" AND _id == "' + uid + '" ');
          db.query( qR, ( e, r ) => {
              if(e){
                  console.log('error in accountModel.Update.passphrase reading account.');
                  console.log(e);
                  next({ "msg": e, "result": false});
              }else{
                  if( r.length === 1 ) {
                      accountMethod.passwordCompare( phrase, r[0].recoveryPhrase, ( result ) => {
                        if( result ) {
                          let qU = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
                          '` SET `recoveryPhraseProved` = true WHERE _type == "account" AND _id == "' +
                          uid + '" AND `deleted` == false ');
                          db.query(qU, function(e, r, m) {
                              if(e){
                                  console.log('error in accountModel.Update.passphraseProved');
                                  console.log(e);
                                  next({ "error": e, "msg": errMsg.errorMsg, "result": false });
                              }else{
                                  if( m.status == 'success' && m.metrics.mutationCount === 1 ) {
                                      next({ "result": true });
                                  } else {
                                      if( r.length === 0 ) {
                                          next({ "msg": errMsg.accountNotFound, "result": false });
                                      } else {
                                          next({ "msg": errMsg.updateGenericFail, "result": false });
                                      }
                                  }
                              }
                          });
                        } else {
                          next({ "msg": errMsg.accountValidationFailure, "result": false });
                        }
                      });
                  } else if( r.length === 0 ) {
                    next({ "msg": errMsg.accountNotFound, "result": false });
                  } else {
                    next({ "msg": 'Unexpected result', "result": false });
                  }
              }
          });
        },
      password: ( uid, oldPassword, newPassword, next ) => {
            if( accountMethod.validatePassword( newPassword ) ) {
                accountMethod.getUserById( uid, false, ( account ) => {
                    if( account.result ) {
                        accountMethod.passwordCompare( oldPassword, account.data.password, ( compareResult ) => {
                            if( compareResult ) {
                                accountMethod.ink( newPassword, ( hash, inkMsg) => {
                                    if( hash ) {
                                        let q = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET + '` SET `password` = $1 WHERE _type == "account" AND _id == "' + uid + '" ');
                                        db.query(q, [hash], function(e, r, m) {
                                            if(e){
                                                console.log('error in accountModel.Update.password');
                                                console.log(e);
                                                next({ "error": e, "msg": errMsg.errorMsg, "result": false });
                                            }else{
                                                if( m.status == 'success' && m.metrics.mutationCount == 1 )
                                                    next({ "result": true });
                                                else
                                                    next({ "msg": errMsg.updateGenericFail, "result": false });
                                            }
                                        });
                                    } else {
                                        next({ "msg": inkMsg, "result": false });
                                    }
                                });
                            } else {
                                next({ "msg": errMsg.accountValidationFailure, "result": false });
                            }
                        });
                    } else {
                        next( account );
                    }
                });
            } else {
                next({ "msg": errMsg.passwordTooShort, "result": false });
            }
        },
      recoverAccount: ( username, recoveryPhrase, next ) => {
          const q = N1qlQuery.fromString('SELECT `recoveryPhrase`, `_id` FROM `' + process.env.BUCKET + '` WHERE _type == "account" AND `username` == "' + username + '" ');
          db.query(q, function(e, r) {
            if(e){
              console.log('error in accountMethod.recoverAccount');
              console.log(e);
              next({ "error": e, "msg": errMsg.errorMsg, "result": false });
            }else{
              if( r.length === 1){
                accountMethod.passwordCompare( recoveryPhrase, r[0].recoveryPhrase, ( result ) => {
                  if( result ) {
                    accountMethod.update2a( r[0]._id, false, ( update2aResult ) => {
                      if( update2aResult.result )
                        next({ "result": true });
                      else
                        next({ "msg": errMsg.recoveryFailed, "result": false });
                    });
                  } else {
                    next({ "msg": errMsg.recoveryFailed, "result": false });
                  }
                });
              } else {
                next({ "msg": errMsg.recoveryFailed, "result": false });
              }
            }
          });
        },
      role: ( uid, role, next ) => {
            if( accountMethod.roleExists( role ) ) {
                accountModel.Read.accountById( uid, ( acct ) => {
                    if( acct.result ) {
                        if( acct.data.roles ) acct.data.roles.push(role);
                        else acct.data.roles = [ role ];

                        const qU = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
                        '` SET roles = ' + JSON.stringify( acct.data.roles ) +
                        ' WHERE _type == "account" AND _id == "' + uid + '" ');
                        db.query(qU, function(e, r, m) {
                            if(e){
                                console.log('error in accountModel.Update.role');
                                console.log(e);
                                next({ "error": e, "msg": errMsg.errorMsg, "result": false });
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
                next({ "msg": errMsg.roleInvalid, "result": false });
            }
        },
      twoStep: ( uid, token, twoA, next ) => {
            accountMethod.getUserById( uid, false, ( account ) => {
                if( account.result ){
                    if( account.data.recoveryPhraseProved ) {
                        if( account.data.enable2a != twoA && account.data.enable2a ) {
                          accountMethod.validate2a( account.data.secret, token, ( validated ) => {
                            if( validated ) {
                              accountMethod.update2a( uid, twoA, ( resultObj ) => {
                                next( resultObj );
                              });
                            } else {
                              next({ "msg": errMsg.accountValidationFailure, "result": false});
                            }
                          });
                        } else {
                          accountMethod.update2a( uid, twoA, ( resultObj ) => {
                            next( resultObj );
                          });
                        }
                      } else {

                        next({ "msg": errMsg.recoveryPhraseNotProved, "result": false });
                      }
                } else {
                    next({ "msg": errMsg.accountNotFound, "result": false });
                }

            });
        }
    },
    Delete: {
      accountSoftly: ( username, password, ips, twoAtoken, next) => {
          accountModel.Read.validateAccount( username, password, ips, twoAtoken, ( result ) => {
            if( result.result ) {
              const qU = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
              '` SET deleted = true WHERE _type == "account" AND `username` == "' + username + '" ');
              db.query(qU, function(e, r, m) {
                if(e){
                  console.log('error in accountModel.Delete.accountSoftly');
                  console.log(e);
                  next({ "error": e, "msg": errMsg.errorMsg, "result": false });
                }else{
                  if( m.status == 'success' && m.metrics.mutationCount === 1 ) {
                    next({ "result": true });
                  } else {
                    next({ "msg": errMsg.updateGenericFail, "result": false });
                  }
                }
              });
            } else {
              next( result );
            }
          });
        },
      accountHard: ( uid, password, token, next) => {

            next();

        },
    }
};
// Non Public Methods
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
    getUserById: ( uid, allowDeleted, next ) => {
      let query = 'SELECT ' + fields + ', `enable2a`, `password`, `secret`, `recoveryPhrase`, `recoveryPhraseProved` FROM `' + process.env.BUCKET + '` WHERE _type == "account" AND _id == "'
      + uid + '" ';
      if( !allowDeleted ) query += ' AND `deleted` == false ';

      const q = N1qlQuery.fromString(query);
        db.query(q, function(e, r) {
          if(e){
            console.log('error in accountMethod.getUserById');
            console.log(e);
            next({ "error": e, "msg": errMsg.errorMsg, "result": false });
          }else{
            if( r.length === 1)
              next({ "data": r[0], "result": true });
            else if( r.length === 0 )
              next({ "msg": errMsg.accountNotFound, "result": false });
            else
              next({ "msg": errMsg.errorMsg, "result": false });
          }
        });
    },
    getAccountByUsername: ( username, allowDeleted, next ) => {
      let query = 'SELECT ' + fields + ', `enable2a`, `password`, `secret`, `recoveryPhrase`, `recoveryPhraseProved` FROM `' + process.env.BUCKET + '` WHERE _type == "account" AND `username` == "' + username + '" ';
      if( !allowDeleted ) query += ' AND `deleted` == false ';

      const q = N1qlQuery.fromString(query);
        db.query(q, function(e, r) {
          if(e){
            console.log('error in accountMethod.getUserById');
            console.log(e);
            next({ "error": e, "msg": errMsg.errorMsg, "result": false });
          }else{
            if( r.length === 1)
              next({ "data": r[0], "result": true });
            else if( r.length === 0 )
              next({ "msg": errMsg.accountNotFound, "result": false });
            else
              next({ "msg": errMsg.errorMsg, "result": false });
          }
        });
    },
    ink: ( password, next ) => {
        bcrypt.genSalt( 5, function( e, salt ) {
            if( e ) {
                console.error( e );
                next( false, e );
            } else {
                bcrypt.hash( password, salt, function( er, hash ) {
                    if( er ) {
                        console.error( er );
                        next( false, er );
                    }else{
                        next( hash, null );
                    }
                });
            }
        });
    },
    isVal: ( value ) => {
        return ( value && value !== null && value !== '' );
    },
    passwordCompare: ( pwd, hash, next ) => {
      bcrypt.compare( pwd, hash, function( e, r ) {
        if( e ) {
          console.log(' Error accountMethod passwordCompare');
          console.log( e );
        } else {
          next( r );
        }
      });
    },
    preValidateModel: ( account ) => {
        let result = true, msg = '';
        if( !accountMethod.validateEmail( account.email ) ) {
            result = false;
            msg = errMsg.emailInvalid;
        }
        if( !accountMethod.validatePassword( account.password ) ) {
            result = false;
            msg += errMsg.passwordTooShort;
        }
        if( !accountMethod.validateUsername( account.username ) ) {
            result = false;
            msg += errMsg.usernameTooShort;
        }
        account._id = uuidv4();
        account._type = 'account';
        account.blocked = false;
        account.deleted = false;
        return ({ result, msg, account });
    },
    roleExists: ( role ) => {
        return roles.includes(role);
    },
    saveQR: ( uid, secret, next ) => {
      const qU = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
      '` SET secret = "' + secret + '" WHERE _type == "account" AND _id == "' + uid + '" AND `deleted` == false ');
      db.query(qU, function(e, r, m) {
          if(e){
              console.log('error in accountMethod.saveQR');
              console.log(e);
              next({ "error": e, "msg": errMsg.errorMsg, "result": false });
          }else{
              if( m.status == 'success' && m.metrics.mutationCount == 1 )
                  next({ "result": true });
              else
                  next({ "msg": errMsg.updateGenericFail, "result": false });
          }
      });
    },
    update2a: ( uid, twoA, next ) => {
        let q = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET + '` SET `enable2a` = ' +
        twoA + ' WHERE _type == "account" AND _id == "' + uid + '" ');
        db.query(q, function(e, r, m) {
            if(e){
                console.log('error in accountModel.accountMethod update2a.');
                console.log(e);
                next({ "error": e, "msg": errMsg.errorMsg, "result": false });
            }else{
                if( m.status === 'success' && m.metrics.mutationCount === 1 )
                    next({ "result": true });
                else
                    next({ "msg": 'Not a successful update.', "result": false });
            }
        });
    },
    updateToken: ( uid, ips, next ) => {
        const token = jwt.sign({ _id: uid, ips }, process.env.JWT_SECRET,
          { expiresIn: '7 days' } );
        // Pass back token to be stored by user.
        next( token );
    },
    validate2a: ( secret, token ) => {
        const result = speakeasy.totp.verify({
            "secret": secret,
            "encoding": 'base32',
            "token": token
        });
        return result;
    },
    validateEmail: ( email ) => validator.isEmail( email ),
    validatePassword: ( password ) => {
        if( password.length < 8 ) return false;
        else return true;

        // TODO add regex here.
    },
    validateUsername: ( username ) => ( username.length >= 3 ),
};
module.exports = accountModel;

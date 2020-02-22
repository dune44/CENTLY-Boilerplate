const accountModel = require('../../controllers/account.model');
const couchbase = require('couchbase');
const N1qlQuery = couchbase.N1qlQuery;
const db = require('./../../controllers/db');
const chai = require('chai');
const expect = chai.expect;
const uuidv4 = require('uuid/v4');

/*
Test Template

describe( '', () => {

  // Property Exists

  // Property Type

  // Return Value

});

*/

let newAccount,
    newBadPasswordAccount,
    newBadUsernameAccount,
    newBadEmailAccount;

const username = 'testuser';
const password = '1A2b6O!b';

describe( 'Account Model Create a user account', () => {

  function clearAccounts( next ){
      const q = N1qlQuery.fromString( 'DELETE FROM `'+process.env.BUCKET+'`' );
      db.query( q, function( e ) {
          if(e){
              console.log( 'error in deleting test db' );
              console.log( e );
          }else{
              // console.log( 'meta from deleting.' );
              // console.log( m );
              //console.log( 'count from deleting.' );
              //console.log( m.metrics.mutationCount );
              //console.log( 'test db cleared ' );
          }
          //console.log( 'end testing statement.' );
          next();
      });
  }

  function indexAvailable(next){
      //console.log('testing test indexes.');
      const q1 = N1qlQuery.fromString('SELECT * FROM `'+process.env.BUCKET+'` WHERE `username` = "username" ');
      db.query(q1, function( e, r, m) {
          if(e){
              //console.log('index query failed');
              // console.log('query used:');
              // console.log(q1);
              // console.log();
              // console.log('error');
              // console.log(e);
              next( false );
          } else {
              next( true );
          }
      });
  }

  function buildPrimaryIndex( next ) {
      const testPKaccount = N1qlQuery.fromString('CREATE PRIMARY INDEX ON `'+process.env.BUCKET+'`');
      db.query(testPKaccount, function(e) {
          if(e) {
              //console.log('testPKaccount failed.');
              //console.log(e);
          } else {
              //console.log('testPKaccount should be added.');
          }
          next();
      });
  }

  function buildIndexes( next ) {
      const testFKaccount_username =  N1qlQuery.fromString( 'CREATE INDEX testFKaccount_username ON `'+process.env.BUCKET+'`(username) where `_type` == account' );
      db.query(testFKaccount_username, function( e ) {
          //if( e ) {
              //console.log( 'testFKaccount_username failed.' );
              //console.log( e );
          //} else {
              //console.log( 'testFKaccount_username should be added.' );
          //}
          next();
      });
  }

  function runDbCalls( next ){
      initializeAccount( () => {
          initializeBadPasswordAccount( () => {
              initializeBadUsernameAccount( () => {
                  initializeBadEmailAccount( next );
              });
          });
      });
  }

  function initializeAccount( next ) {
      const testUser = {
          "username": username,
          "password": password,
          "email": "bob@somesite.com",
      };
      accountModel.Create.account( testUser, ( goodResult ) => {
          newAccount = goodResult;
          next();
      });
  }

  function initializeBadPasswordAccount( next ) {
      const testUser = {
          "username": "testuser2",
          "password":"1A2b6b",
          "email": "dune44@hotmail.com",
      };
      accountModel.Create.account(testUser, (badResult) => {
          newBadPasswordAccount = badResult;
          next();
      });
  }

  function initializeBadUsernameAccount( next ){
      const testUser = {
          "username": "te",
          "password":"2M@iP931p",
          "email": "dune44@hotmail.com",
      };
      accountModel.Create.account(testUser, (badResult) => {
          newBadUsernameAccount = badResult;
          next();
      });
  }

  function initializeBadEmailAccount( next ){
      const testUser = {
          "username": "testuser3",
          "password":"2M@iP931p",
          "email": "hotmail.com",
      };
      accountModel.Create.account(testUser, (badResult) => {
          newBadEmailAccount = badResult;
          next();
      });
  }

    before( ( done ) => {
        //console.log( 'Start before statement' );
        clearAccounts( () => {
            indexAvailable( ( result ) => {
                if ( !result ) {
                    //console.log( 'build indexes' );
                    buildPrimaryIndex( () => {
                        buildIndexes( () => {
                            runDbCalls( done );
                        });
                    });
                } else {
                    //console.log( 'Indexes built, proceed.' );
                    runDbCalls( done );
                }
            });
        });
    });

    after( ( done ) => {
        setTimeout( done, 10);
    });

    describe( 'Proper Account Creation', () => {

      // Property Existence
      it( 'newAccount data should have property email', () => {
          expect( newAccount.data ).to.have.property( 'email' );
      });

      it( 'newAccount should have property password', () => {
          expect( newAccount.data ).to.have.property( 'password' );
      });

      it( 'newAccount should have property result', () => {
         expect( newAccount ).to.have.property( 'result' );
      });

      it( 'newAccount should have property username', () => {
          expect( newAccount.data ).to.have.property( 'username' );
      });

      // Property Type
      it( 'newAccount email should be a string', () => {
        expect( newAccount.data.email ).to.be.a( 'string' );
      });

      it( 'newAccount password should be a string', () => {
        expect( newAccount.data.password ).to.be.a( 'string' );
      });

      it( 'newAccount username should be a string', () => {
        expect(newAccount.data.username).to.be.a( 'string' );
      });

      // Return Value
      it( 'newAccount should not return false', () => {
        expect( newAccount ).to.not.equal( false );
      });

      it( 'newAccount should have a password longer than 30', () => {
        expect( newAccount.data.password ).to.have.lengthOf.at.least( 30 );
      });

      it( 'newAccount should have a username longer than 3', () => {
        expect( newAccount.data.username ).to.have.lengthOf.at.least( 3 );
      });

    });

    describe( 'Account Created with Bad Password', () => {

      // Property Existence
      it( 'newBadPasswordAccount should contain an error message', () => {
          expect( newBadPasswordAccount ).to.have.property( 'msg' );
      });

      it( 'newBadPasswordAccount should have property result', () => {
          expect( newBadPasswordAccount ).to.have.property( 'result' );
      });

      // Property Type
      it( 'newBadPasswordAccount result should be a boolean', () => {
          expect( newBadPasswordAccount.result ).to.have.be.a( 'boolean' );
      });

      it( 'newBadPasswordAccount msg should be a string', () => {
          expect( newBadPasswordAccount.msg ).to.have.be.a( 'string' );
      });

      // Return Value
      it( 'newBadPasswordAccount should have result of false', () => {
          expect( newBadPasswordAccount.result ).to.equal( false );
      });

    });

    describe( 'Account Creation with Username that is too short.', () => {

      // Property Existence
      it( 'newBadUsernameAccount should contain an error message', () => {
          expect( newBadUsernameAccount ).to.have.property( 'msg' );
      });

      it( 'newBadUsernameAccount  should have property result', () => {
          expect( newBadUsernameAccount ).to.have.property( 'result' );
      });

      // Property Type
      it( 'newBadUsernameAccount result should be a boolean', () => {
          expect( newBadUsernameAccount.result ).to.have.be.a( 'boolean' );
      });

      it( 'newBadUsernameAccount msg should be a string', () => {
          expect( newBadUsernameAccount.msg ).to.have.be.a( 'string' );
      });

      // Return Value
      it( 'newBadUsernameAccount should have result of false', () => {
          expect( newBadUsernameAccount.result ).to.equal( false );
      });

    });

    describe( 'Account Created with a Bad Email', () => {

      // Property Existence
      it( 'newBadEmailAccount should contain an error message', () => {
          expect( newBadEmailAccount ).to.have.property( 'msg' );
      });

      it( 'newBadEmailAccount should have property result', () => {
          expect( newBadEmailAccount ).to.have.property( 'result' );
      });

      // Property Type
      it( 'newBadEmailAccount result should be a boolean', () => {
          expect( newBadEmailAccount.result ).to.have.be.a( 'boolean' );
      });

      it( 'newBadEmailAccount msg should be a string', () => {
          expect( newBadEmailAccount.msg ).to.have.be.a( 'string' );
      });

      // Return Value
      it( 'newBadEmailAccount should have result of false', () => {
          expect( newBadEmailAccount.result ).to.equal( false );
      });

    });

});

describe( 'Account Model Create a duplicate username in account', () => {

  let newBadDuplicateNameAccount;

  function attemptDuplicateUsername( next ) {
    const testUser = {
      "username": username,
      "password":"8I3a9B!bc",
      "email": "fred@somesite.com",
    };
    accountModel.Create.account(testUser, ( result ) => {
      newBadDuplicateNameAccount = result;
      next();
    });
  }

  before( ( done ) => {
    attemptDuplicateUsername( done );
  });

  after( ( done ) => {
    done();
  });

  // Property Existence
  it( 'newBadDuplicateNameAccount should have property result', () => {
    expect(newBadDuplicateNameAccount).to.have.property('result');
  });

  it( 'newBadDuplicateNameAccount should have property msg', () => {
    expect(newBadDuplicateNameAccount).to.have.property('msg');
  });

  // Property Type
  it( 'newBadDuplicateNameAccount result should be a boolean', () => {
    expect( newBadDuplicateNameAccount.result ).to.have.be.a( 'boolean' );
  });

  it( 'newBadDuplicateNameAccount msg should be a string', () => {
    expect( newBadDuplicateNameAccount.msg ).to.have.be.a( 'string' );
  });

  // Return Value
  it( 'newBadDuplicateNameAccount should have result of false', () => {
    expect( newBadDuplicateNameAccount.result ).to.equal( false );
  });

});

let readAccountByUsernameResult, testAccountUID;

describe( 'Account Model Read accountByUsername', () => {

    describe( 'Read Account with Good Username', () => {

      function readTestAccountUsername( next ){
          accountModel.Read.accountByUsername( username, (result) => {
              readAccountByUsernameResult = result;
              testAccountUID = result.data._id;
              // console.log( 'testAccountUID' );
              // console.log( testAccountUID );
              next();
          });
      }

      before( ( done ) => {
          readTestAccountUsername( done );
      });

      after( ( done ) => {
          setTimeout( done, 1);
      });

      // Property Exists
      it( 'readAccountByUsernameResult should contain property data', () => {
          expect( readAccountByUsernameResult ).to.have.property( 'data' );
      });

      it( 'readAccountByUsernameResult should contain property data._id', () => {
          expect( readAccountByUsernameResult.data ).to.have.property( '_id' );
      });

      it( 'readAccountByUsernameResult should contain property data._type', () => {
          expect( readAccountByUsernameResult.data) .to.have.property( '_type' );
      });

      it( 'readAccountByUsernameResult should contain property data.blocked', () => {
          expect( readAccountByUsernameResult.data ).to.have.property( 'blocked' );
      });

      it( 'readAccountByUsernameResult should contain property data.deleted', () => {
          expect(readAccountByUsernameResult.data).to.have.property('deleted');
      });

      it( 'readAccountByUsernameResult should contain property data.email', () => {
          expect(readAccountByUsernameResult.data).to.have.property('email');
      });

      it( 'readAccountByUsernameResult should NOT contain property data.password', () => {
          expect(readAccountByUsernameResult.data).to.not.have.property('password');
      });

      it( 'readAccountByUsernameResult should contain property data.username', () => {
          expect(readAccountByUsernameResult.data).to.have.property('username');
      });

      it( 'readAccountByUsernameResult should NOT contain property msg', () => {
          expect(readAccountByUsernameResult).to.not.have.property('msg');
      });

      it( 'readAccountByUsernameResult should contain property result', () => {
          expect(readAccountByUsernameResult).to.have.property('result');
      });

      // Property Type
      it( 'readAccountByUsernameResult email should be a data._id', () => {
          expect( readAccountByUsernameResult.data._id ).to.be.a( 'string' );
      });

      it( 'readAccountByUsernameResult email should be a data._type', () => {
          expect( readAccountByUsernameResult.data._type ).to.be.a( 'string' );
      });

      it( 'readAccountByUsernameResult email should be a data.blocked', () => {
          expect( readAccountByUsernameResult.data.blocked ).to.be.a( 'boolean' );
      });

      it( 'readAccountByUsernameResult email should be a data.deleted', () => {
          expect( readAccountByUsernameResult.data.deleted ).to.be.a( 'boolean' );
      });

      it( 'readAccountByUsernameResult email should be a data.email', () => {
          expect( readAccountByUsernameResult.data.email ).to.be.a( 'string' );
      });

      it( 'readAccountByUsernameResult data.username should be a string', () => {
          expect( readAccountByUsernameResult.data.username ).to.be.a( 'string' );
      });

      it( 'readAccountByUsernameResult result should be a boolean', () => {
          expect( readAccountByUsernameResult.result ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'readAccountByUsernameResult result should have result of true', () => {
          expect( readAccountByUsernameResult.result ).to.equal( true );
      });

    });

    describe( 'Read Account with Bad Username', () => {

    let readBadUsernameAccountResult;
    const badUsername_ReadBadUsernameAccount = 'WillowOfWindsleyDate';
    const msgReadBadUsernameAccountResult = 'Result not found for ' + badUsername_ReadBadUsernameAccount;
    const badMsg_ReadBadUsernameAccount = 'There is a duplicate found for ' + username;

    function readBadUsernameAccount( next ) {
      accountModel.Read.accountByUsername( badUsername_ReadBadUsernameAccount, ( result ) => {
        readBadUsernameAccountResult = result;
        next();
      });
    }

    before( ( done ) => {
      readBadUsernameAccount( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Exists -- ( readBadUsernameAccountResult )
    it( 'readBadUsernameAccountResult should NOT contain property data', () => {
      expect( readBadUsernameAccountResult ).to.not.have.property( 'data' );
    });

    it( 'readBadUsernameAccountResult should NOT contain property error', () => {
      expect( readBadUsernameAccountResult ).to.not.have.property( 'error' );
    });

    it( 'readBadUsernameAccountResult should contain property msg', () => {
      expect(readBadUsernameAccountResult).to.have.property('msg');
    });

    it( 'readBadUsernameAccountResult should contain property result', () => {
      expect(readBadUsernameAccountResult).to.have.property('result');
    });

    // Property Type
    it( 'readBadUsernameAccountResult msg should be a string', () => {
        expect( readBadUsernameAccountResult.msg ).to.be.a( 'string' );
    });

    it( 'readBadUsernameAccountResult result should be a boolean', () => {
        expect( readBadUsernameAccountResult.result ).to.be.a( 'boolean' );
    });

    // Return Value

    it( 'readBadUsernameAccountResult msg should NOT have result of badMsg_ReadBadUsernameAccount: ' + badMsg_ReadBadUsernameAccount, () => {
        expect( readBadUsernameAccountResult.msg ).to.not.equal( badMsg_ReadBadUsernameAccount );
    });

    it( 'readBadUsernameAccountResult msg should have result of msgReadBadUsernameAccountResult: ' + msgReadBadUsernameAccountResult, () => {
        expect( readBadUsernameAccountResult.msg ).to.equal( msgReadBadUsernameAccountResult );
    });

    it( 'readBadUsernameAccountResult result should have result of false', () => {
        expect( readBadUsernameAccountResult.result ).to.equal( false );
    });

  });

});

describe( 'Account Model Read accountById', () => {

  describe( 'Read Account with Good UID.', () => {

    let readAccountByIDResult;

    function readTestAccountByUID( next ){
      accountModel.Read.accountById( testAccountUID, ( result ) => {
        readAccountByIDResult = result;
        next();
      });
    }

      before( ( done ) => {
          readTestAccountByUID( done );
      });

      after( ( done ) => {
          done();
      });

      // Property Exists
      it('readAccountByIDResult should return property data', () => {
          expect(readAccountByIDResult).to.have.property('data');
      });

      it('readAccountByIDResult should return property data._id', () => {
          expect(readAccountByIDResult.data).to.have.property('_id');
      });

      it('readAccountByIDResult should return property data._type', () => {
          expect(readAccountByIDResult.data).to.have.property('_type');
      });

      it('readAccountByIDResult should return property data.blocked', () => {
          expect(readAccountByIDResult.data).to.have.property('blocked');
      });

      it('readAccountByIDResult should return property data.deleted', () => {
          expect(readAccountByIDResult.data).to.have.property('deleted');
      });

      it('readAccountByIDResult should return property data.email', () => {
          expect(readAccountByIDResult.data).to.have.property('email');
      });

      it('readAccountByIDResult should NOT return property data.password', () => {
          expect(readAccountByIDResult.data).to.not.have.property('password');
      });

      it('readAccountByIDResult should return property data.username', () => {
          expect(readAccountByIDResult.data).to.have.property('username');
      });

      it('readAccountByIDResult should NOT return property msg', () => {
          expect(readAccountByIDResult).to.not.have.property('msg');
      });

      it('readAccountByIDResult should return property result', () => {
          expect(readAccountByIDResult).to.have.property('result');
      });

      // Property Type
      it( 'readAccountByIDResult data id should be a string', () => {
          expect( readAccountByIDResult.data._id ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult data _type should be a string', () => {
          expect( readAccountByIDResult.data._type ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult data blocked should be a boolean', () => {
          expect( readAccountByIDResult.data.blocked ).to.be.a( 'boolean' );
      });

      it( 'readAccountByIDResult data deleted should be a boolean', () => {
          expect( readAccountByIDResult.data.deleted ).to.be.a( 'boolean' );
      });

      it( 'readAccountByIDResult data email should be a string', () => {
          expect( readAccountByIDResult.data.email ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult data username should be a string', () => {
          expect( readAccountByIDResult.data.username ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult result should be a boolean', () => {
          expect( readAccountByIDResult.result ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'readAccountByIDResult result should have result of true', () => {
          expect( readAccountByIDResult.result ).to.equal( true );
      });

  });

  describe( 'Read Account with Bad UID', () => {

    let readBadUIDAccountResult;
    const badUID = uuidv4();
    const badUIDMsg = 'no user found.';

    function badUID_readAccountbyID( next ) {
      accountModel.Read.accountById( badUID, ( result ) => {
        readBadUIDAccountResult = result;
        next();
      });
    }

    before( ( done ) => {
      badUID_readAccountbyID( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Exists
    it( 'readBadUIDAccountResult should NOT contain property data', () => {
      expect( readBadUIDAccountResult ).to.not.have.property( 'data' );
    });

    it( 'readBadUIDAccountResult should contain property msg', () => {
      expect( readBadUIDAccountResult ).to.have.property( 'msg' );
    });

    it( 'readBadUIDAccountResult should contain property result', () => {
      expect( readBadUIDAccountResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'readBadUIDAccountResult msg id should be a string', () => {
        expect( readBadUIDAccountResult.msg ).to.be.a( 'string' );
    });

    it( 'readBadUIDAccountResult result id should be a boolean', () => {
        expect( readBadUIDAccountResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'readBadUIDAccountResult msg should have value of var badUIDMsg: ' + badUIDMsg , () => {
        expect( readBadUIDAccountResult.msg ).to.equal( badUIDMsg );
    });

    it( 'readBadUIDAccountResult result should have value of false', () => {
        expect( readBadUIDAccountResult.result ).to.equal( false );
    });

  });

});

describe( 'Account Model Read All', () => {

  let readAllResult;

  function readAllAccounts( next ) {
      accountModel.Read.all( ( result ) => {
        readAllResult = result;
        next();
      });
  }

  before( ( done ) => {
    readAllAccounts( done );
  });

  after( ( done ) => {
    done();
  });

  // Porperty Exists
  it( 'readAllResult should NOT have property msg', () => {
    expect(readAllResult).to.have.not.property('msg');
  });

  it('readAllResult should have property data', () => {
      expect(readAllResult).to.have.property('data');
  });

  it('readAllResult should have property result', () => {
      expect(readAllResult).to.have.property('result');
  });

  // Property Type
  it( 'readAllResult data should be an Array', () => {
      expect( readAllResult.data ).to.be.a( 'array' );
  });

});

let validationToken;

describe( 'Account Model Read Validate Credentials', () => {

  let badUsernameLoginResult, badPasswordLoginResult, goodLogingResult;
  const validationerrmsg = 'Account validation failed.';
  const fauxIPS = { "ip": "10.0.0.0", "fwdIP": "5.0.0.0" };

  function attemptbadUsernameLogin( next ) {
    const testUser = {
        "username": "babbadleroybrown",
        "password": "85Ie!ki49p",
        "ips": fauxIPS,
    };
    accountModel.Read.validateAccount( testUser, ( result ) => {
      badUsernameLoginResult = result;
      next();
    });
  }

  function attemptbadPasswordLogin( next ) {
    const testUser = {
        "username": username,
        "password": "2M@55iP931p",
        "ips": fauxIPS,
    };
    accountModel.Read.validateAccount( testUser, ( result ) => {
      badPasswordLoginResult = result;
      next();
    });
  }

  function attemptGoodLogin( next ) {
    const testUser = {
        "username": username,
        "password": password,
        "ips": fauxIPS,
    };
    accountModel.Read.validateAccount( testUser, ( result ) => {
      validationToken = result.token;
      goodLogingResult = result;
      next();
    });
  }

  before( ( done ) => {
    attemptbadUsernameLogin( () => {
      attemptbadPasswordLogin( () => {
        attemptGoodLogin( done );
      });
    });
  });

  after( ( done ) => {
    done();
  });

  describe( 'Test Bad Username', () => {
    // Property Existence -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult should NOT have property data', () => {
      expect( badUsernameLoginResult ).to.not.have.property( 'data' );
    });

    it( 'badUsernameLoginResult should NOT have property token', () => {
      expect( badUsernameLoginResult ).to.not.have.property( 'token' );
    });

    it( 'badUsernameLoginResult should have property result', () => {
      expect( badUsernameLoginResult ).to.have.property( 'result' );
    });

    it( 'badUsernameLoginResult should have property msg', () => {
      expect( badUsernameLoginResult ).to.have.property( 'msg' );
    });

    // Property Type -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult result should be a boolean', () => {
      expect( badUsernameLoginResult.result ).to.be.a( 'boolean' );
    });

    it( 'badUsernameLoginResult msg should be a string', () => {
      expect( badUsernameLoginResult.msg ).to.be.a( 'string' );
    });

    // Return Value -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult result should have value of false', () => {
      expect( badUsernameLoginResult.result ).to.equal( false );
    });

    it( 'badUsernameLoginResult msg should have value of var validationerrmsg: ' + validationerrmsg, () => {
      expect( badUsernameLoginResult.msg ).to.equal( validationerrmsg );
    });

  });

  describe( 'Test Bad Password', () => {
    // Property Existence -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult should NOT have property data', () => {
      expect( badPasswordLoginResult ).to.not.have.property( 'data' );
    });

    it( 'badPasswordLoginResult should NOT have property token', () => {
      expect( badPasswordLoginResult ).to.not.have.property( 'token' );
    });

    it( 'badPasswordLoginResult should have property result', () => {
      expect( badPasswordLoginResult ).to.have.property( 'result' );
    });

    it( 'badPasswordLoginResult should have property msg', () => {
      expect( badPasswordLoginResult ).to.have.property( 'msg' );
    });

    // Property Type -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult result should be a boolean', () => {
      expect( badPasswordLoginResult.result ).to.be.a( 'boolean' );
    });

    it( 'badPasswordLoginResult msg should be a string', () => {
      expect( badPasswordLoginResult.msg ).to.be.a( 'string' );
    });

    // Return Value -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult result should have value of false', () => {
      expect( badPasswordLoginResult.result ).to.equal( false );
    });

    it( 'badPasswordLoginResult msg should have value of var validationerrmsg: ' + validationerrmsg, () => {
      expect( badPasswordLoginResult.msg ).to.equal( validationerrmsg );
    });

  });

  describe( 'Test good login', () => {
    // Property Existence -- ( goodLogingResult )
    it( 'goodLogingResult should NOT have property data', () => {
      expect( goodLogingResult ).to.not.have.property( 'data' );
    });

    it( 'goodLogingResult should NOT have property msg', () => {
      expect( goodLogingResult ).to.not.have.property( 'msg' );
    });

    it( 'goodLogingResult should have property result', () => {
      expect( goodLogingResult ).to.have.property( 'result' );
    });

    it( 'goodLogingResult should have property token', () => {
      expect( goodLogingResult ).to.have.property( 'token' );
    });

    // Property Type -- ( goodLogingResult )
    it( 'goodLogingResult result should be a boolean', () => {
      expect( goodLogingResult.result ).to.be.a( 'boolean' );
    });

    it( 'goodLogingResult token should be a string', () => {
      expect( goodLogingResult.token ).to.be.a( 'string' );
    });

    // Return Value -- ( goodLogingResult )
    it( 'goodLogingResult result should have value of true', () => {
      expect( goodLogingResult.result ).to.equal( true );
    });

  });

});

describe( 'Account Model Read Token Operations', () => {

  let decodedToken;
  const expiresInDefault = 'in 7 days';

  function getTokenDecode( next ) {
    accountModel.Read.verifyToken( validationToken, ( token ) => {
      decodedToken = token;
      //console.log( token );
      next();
    });
  }

  describe( ' Validating a good token. ', () => {

    before( ( done ) => {
      getTokenDecode( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Existence -- ( decodedToken )
    it( 'decodedToken should NOT have property error', () => {
        expect( decodedToken ).to.not.have.property( 'error' );
    });

    it( 'decodedToken should NOT have property msg', () => {
        expect( decodedToken ).to.not.have.property( 'msg' );
    });

    it( 'decodedToken should have property result', () => {
        expect( decodedToken ).to.have.property( 'result' );
    });

    it( 'decodedToken should have property expiresIn', () => {
        expect( decodedToken ).to.have.property( 'expiresIn' );
    });


    // Property Type -- ( decodedToken )
    it( 'decodedToken should be an Object', () => {
      expect( decodedToken ).to.be.a( 'Object' );
    });

    it( 'decodedToken expiresIn should be a String', () => {
      expect( decodedToken.expiresIn ).to.be.a( 'string' );
    });

    // Return Value -- ( decodedToken )
    it( 'decodedToken result should have value of true', () => {
        expect( decodedToken.result ).to.equal( true );
    });

    it( 'decodedToken expiresIn should have value equal to var expiresInDefault: '+ expiresInDefault, () => {
        expect( decodedToken.expiresIn ).to.equal( expiresInDefault );
    });

  });


});

describe( 'Account Model Read rolesById', () => {

  describe( 'Read Roles with Good UID', () => {
    let readRolesResult;

    // Property Exists
    it( 'readRolesResult should NOT have property error', () => {
        expect( readRolesResult ).to.not.have.property( 'error' );
    });

    it( 'readRolesResult should NOT have property msg', () => {
        expect( readRolesResult ).to.not.have.property( 'msg' );
    });

    it( 'readRolesResult should have property result', () => {
        expect( readRolesResult ).to.have.property( 'result' );
    });

    it( 'readRolesResult should have property data', () => {
        expect( readRolesResult ).to.have.property( 'data' );
    });

    // Property Type
    it( 'readRolesResult should be an Object', () => {
      expect( readRolesResult ).to.be.a( 'Object' );
    });

    it( 'readRolesResult result should be a boolean', () => {
      expect( readRolesResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'readRolesResult result should have of true', () => {
        expect( readRolesResult.result ).to.equal( true );
    });

  });

  describe( 'Read Roles with Bad UID', () => {
    let readRolesBadResult;

    // Property Exists

    it( 'readRolesBadResult should NOT have property data', () => {
      expect( readRolesBadResult ).to.not.have.property( 'data' );
    });

    it( 'readRolesBadResult should NOT have property error', () => {
        expect( readRolesBadResult ).to.not.have.property( 'error' );
    });

    it( 'readRolesBadResult should have property msg', () => {
        expect( readRolesBadResult ).to.have.property( 'msg' );
    });

    it( 'readRolesBadResult should have property result', () => {
        expect( readRolesBadResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'readRolesBadResult should be an Object', () => {
      expect( readRolesBadResult ).to.be.a( 'Object' );
    });

    it( 'readRolesBadResult msg should be a string', () => {
      expect( readRolesBadResult.msg ).to.be.a( 'string' );
    });

    it( 'readRolesBadResult result should be a boolean', () => {
      expect( readRolesBadResult.msg ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'readRolesBadResult result should have value of false', () => {
        expect( readRolesBadResult.result ).to.equal( false );
    });

  });

});

describe('Update', () => {

});

describe('Delete', () => {

});

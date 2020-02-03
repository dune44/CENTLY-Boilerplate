const accountModel = require('../../controllers/account.model');
const couchbase = require('couchbase');
const N1qlQuery = couchbase.N1qlQuery;
const db = require('./../../controllers/db');
const chai = require('chai');
const expect = chai.expect;

let newAccount,
    newBadPasswordAccount,
    newBadUsernameAccount,
    newBadEmailAccount,
    readAccountByUsernameResult,
    testAccountUID,
    readAccountByIDResult;
const username = 'testuser';

function clearAccounts( next ){
    const q = N1qlQuery.fromString( 'DELETE FROM `'+process.env.BUCKET+'`' );
    db.query( q, function( e ) {
        if(e){
            console.log( 'error in deleting test db' )
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
        if( e ) {
            //console.log( 'testFKaccount_username failed.' );
            //console.log( e );
        } else {
            //console.log( 'testFKaccount_username should be added.' );
        }
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
        "password":"1A2b6O!b",
        "email": "dune44@hotmail.com",
    };
    accountModel.Create.account(testUser, (goodResult) => {
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

describe( 'Account Model Create a user account', () => {

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
        setTimeout( done, 3);
    });

    // Property Existance
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
    
    // Failures
    // Bad Password - Account
    it( 'newBadPasswordAccount should contain an error message', () => {
        expect( newBadPasswordAccount ).to.have.property( 'msg' );
    });

    it( 'newBadPasswordAccount should have property result', () => {
        expect( newBadPasswordAccount ).to.have.property( 'result' );
    });

    it( 'newBadPasswordAccount should have result of false', () => {
        expect( newBadPasswordAccount.result ).to.equal( false );
    });

    // Short Username - Account
    it( 'newBadUsernameAccount should contain an error message', () => {
        expect( newBadUsernameAccount ).to.have.property( 'msg' );
    });

    it( 'newBadUsernameAccount  should have property result', () => {
        expect( newBadUsernameAccount ).to.have.property( 'result' );
    });

    it( 'newBadUsernameAccount should have result of false', () => {
        expect( newBadUsernameAccount.result ).to.equal( false );
    });

    // Bad email - Account
    it( 'newBadEmailAccount should contain an error message', () => {
        expect( newBadEmailAccount ).to.have.property( 'msg' );
    });

    it( 'newBadEmailAccount should have property result', () => {
        expect( newBadEmailAccount ).to.have.property( 'result' );
    });

    it( 'newBadEmailAccount should have result of false', () => {
        expect( newBadEmailAccount.result ).to.equal( false );
    });

});

function readTestAccountUsername( next ){
    accountModel.Read.accountByUsername( username, (result) => {
        readAccountByUsernameResult = result;
        testAccountUID = result._id;
        next();
    });
}

describe( 'Account Model Read accountByUsername', () => {

    before( ( done ) => {
        readTestAccountUsername( done );
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

    // Fails

});

function readTestAccountByUID( next ){
    accountModel.Read.accountById( testAccountUID, ( result ) => {
        readAccountByIDResult = result;
        next();
    });
}

describe('Account Model Read accountById', () => {

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
    it( 'readAccountByIDResult email should be a data._id', () => {
        expect( readAccountByIDResult.data._id ).to.be.a( 'string' );
    });

    it( 'readAccountByIDResult email should be a data._type', () => {
        expect( readAccountByIDResult.data._type ).to.be.a( 'string' );
    });

    it( 'readAccountByIDResult email should be a data.blocked', () => {
        expect( readAccountByIDResult.data.blocked ).to.be.a( 'boolean' );
    });

    it( 'readAccountByIDResult email should be a data.deleted', () => {
        expect( readAccountByIDResult.data.deleted ).to.be.a( 'boolean' );
    });

    it( 'readAccountByIDResult email should be a data.email', () => {
        expect( readAccountByIDResult.data.email ).to.be.a( 'string' );
    });

    it( 'readAccountByIDResult data.username should be a string', () => {
        expect( readAccountByIDResult.data.username ).to.be.a( 'string' );
    });

    it( 'readAccountByIDResult result should be a boolean', () => {
        expect( readAccountByIDResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'readAccountByIDResult result should have result of true', () => {
        expect( readAccountByIDResult.result ).to.equal( true );
    });

    // Fails

});

// describe('Read Validate Credentials', () => {

// });

// describe('Update', () => {

// });

// describe('Delete', () => {
     
// });

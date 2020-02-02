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
    readAccount,
    testAccountUID;
const username = 'testuser';

function indexAvailable(next){
    console.log('testing test indexes.');
    const q1 = N1qlQuery.fromString('SELECT * FROM `'+process.env.BUCKET+'` WHERE `username` = "username" ');
    db.query(q1, (e,r,m) =>{
        if(e){
            console.log('index query failed');
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
    db.query(testPKaccount, (e) => {
        if(e) {
            console.log('testPKaccount failed.');
            console.log(e);
        } else {
            console.log('testPKaccount should be added.');
        }
        next();
    });
}

function buildIndexes( next ) {
    const testFKaccount_username =  N1qlQuery.fromString( 'CREATE INDEX testFKaccount_username ON `'+process.env.BUCKET+'`(username) where `_type` == account' );
    db.query(testFKaccount_username, ( e ) => {
        if( e ) {
            console.log( 'testFKaccount_username failed.' );
            console.log( e );
        } else {
            console.log( 'testFKaccount_username should be added.' );
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
        console.log( 'Start before statement' );
            indexAvailable( ( result ) => {
                if ( !result ) {
                    console.log( 'build indexes' );
                    buildPrimaryIndex( () => {
                        buildIndexes( () => {
                            runDbCalls( done );
                        });
                    });
                } else {
                    console.log( 'Indexes built, proceed.' );
                    runDbCalls( done );
                }
        });
    });

    it( 'newAccount should not return false', () => {
            expect( newAccount ).to.not.equal( false );
    });

    it( 'newAccount data should have property email', () => {
        expect( newAccount.data ).to.have.property( 'email' );
    });

    it( 'newAccount email should be a string', () => {
        expect( newAccount.data.email ).to.be.a( 'string' );
    });

    it( 'newAccount should have property password', () => {
        expect( newAccount.data ).to.have.property( 'password' );
    });

    it( 'newAccount password should be a string', () => {
        expect( newAccount.data.password ).to.be.a( 'string' );
    });
    
    it( 'newAccount should have a password longer than 30', () => {
        expect( newAccount.data.password ).to.have.lengthOf.at.least( 30 );
    });

    it( 'newAccount should have property result', () => {
       expect( newAccount ).to.have.property( 'result' );
    });

    it( 'newAccount should have property username', () => {
        expect( newAccount.data ).to.have.property( 'username' );
    });

    it( 'newAccount username should be a string', () => {
        expect(newAccount.data.username).to.be.a( 'string' );
    });

    it( 'newAccount should have a username longer than 3', () => {
        expect( newAccount.data.username ).to.have.lengthOf.at.least( 3 );
    });
    
    //Bad Password - Account
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

function readTestaccountUID( next ){
    accountModel.Read.accountByUsername( username, (result) => {
        readAccount = result;
        testAccountUID = readAccount._id;
        next();
    });
}

describe( 'Account Model Read accountByUsername', () => {

    before( ( done ) => {
        readTestaccountUID( done);
    });

    it( 'readAccount should contain property data._type', () => {
        expect(readAccount.data).to.have.property('_type');
    });

    it( 'readAccount should contain propterty data._id', () => {
        expect(readAccount.data).to.have.property('_id');

    });

    it( 'readAccount should contain propterty data.blocked', () => {
        expect(readAccount.data).to.have.property('blocked');

    });

    it( 'readAccount should contain propterty data.deleted', () => {
        expect(readAccount.data).to.have.property('deleted');

    });

    it( 'readAccount should contain propterty data.email', () => {
        expect(readAccount.data).to.have.property('email');

    });

    it( 'readAccount should NOT contain propterty data.password', () => {
        expect(readAccount.data).to.not.have.property('password');
    });

    it( 'readAccount should contain propterty data.username', () => {
        expect(readAccount.data).to.have.property('username');
    });

    it( 'readAccount should contain propterty msg', () => {
        expect(readAccount).to.have.property('msg');
    });

    it( 'readAccount should contain propterty result', () => {
        expect(readAccount).to.have.property('result');
    });

    // Fails

});

function readAccountByUID(){

}

describe('Account Model Read accountById', () => {

    before( ( ) => {

    });

    it('Should return property msg', () => {
        expect(readAccount).to.have.property('msg');
    });

});

// describe('Read Validate Credentials', () => {

// });

// describe('Update', () => {

// });

// describe('Delete', () => {
     
// });

function clearAccounts( next ){
    const q = N1qlQuery.fromString( 'DELETE FROM `'+process.env.BUCKET+'`' );
    db.query( q, ( e, r, m ) => {
        if(e){
            console.log( 'error in deleting test db' )
            console.log( e );
        }else{
            // console.log( 'meta from deleting.' );
            // console.log( m );
            console.log( 'count from deleting.' );
            console.log( m.metrics.mutationCount );
            console.log( 'test db cleared ' );
        }
        console.log( 'end testing statement.' );
        next();
    });
}

describe( 'Clear out db after tests', () => {

    after( ( done ) => {
        // Allow some timeout to allow db to settle
        setTimeout( () => {
            clearAccounts( done );
        }, 200);
    });

});
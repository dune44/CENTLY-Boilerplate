const accountModel = require('../../controllers/account.model');
const couchbase = require('couchbase');
const N1qlQuery = couchbase.N1qlQuery;
const db = require('./../../controllers/db');
const chai = require('chai');
const expect = chai.expect;

let newAccount;

function clearAccounts(next){
    const q = N1qlQuery.fromString('DELETE FROM `'+process.env.BUCKET+'`');
    db.query(q, (e) => {
        if(e){
            console.log('error in deleting test db')
            console.log(e);
        }else{
            console.log('test db cleared ');
        }
        console.log('end before statement.');
        initializeAccount( next );
    });
}

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
            next(true);
        } else {
            next(false);
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
    const testFKaccount_username =  N1qlQuery.fromString('CREATE INDEX testFKaccount_username ON `'+process.env.BUCKET+'`(username) where `_type` == account');
    db.query(testFKaccount_username, (e) => {
        if(e) {
            console.log('testFKaccount_username failed.');
            console.log(e);
        } else {
            console.log('testFKaccount_username should be added.');
        }
        next();
    });
}

function initializeAccount( complete ){
    const testUser = {
        "username": "testuser",
        "password":"1A2b6O!b",
        "email": "dune44@hotmail.com",
    };
    accountModel.Create.account(testUser, (r) => {
        newAccount = r;
        complete();
    });

}

describe('Account Model Create a user account.', () => {

    before( ( done ) => {
        console.log('Start before statement.');
            indexAvailable((result) => {
                if ( result ) {
                    console.log('build indexes');
                    buildPrimaryIndex( () => {
                        buildIndexes( () => {
                            clearAccounts( done );
                        });
                    });
                } else {
                    clearAccounts( done );
                }
        });
    });

    it('should not return false', () => {
            expect(newAccount).to.not.equal(false);
    });

    it('should have property email', () => {
        expect(newAccount).to.have.property('email');
    });

    it('email should be a string', () => {
        expect(newAccount.email).to.be.a('string');
    });

    it('should have property password', () => {
        expect(newAccount).to.have.property('password');
    });

    it('password should be a string', () => {
        expect(newAccount.password).to.be.a('string');
    });
    
    it('should have a password longer than 30', () => {
        expect(newAccount.password).to.have.lengthOf.at.least(30);
    });

    it('should have property username', () => {
        expect(newAccount).to.have.property('username');
    });

    it('username should be a string', () => {
        expect(newAccount.username).to.be.a('string');
    });

    it('should have a username longer than 3', () => {
        expect(newAccount.username).to.have.lengthOf.at.least(3);
    });
        
});

// describe('Read findOne', () => {

// });

// describe('Read Validate Credentials', () => {

// });

// describe('Update', () => {

// });

// describe('Delete', () => {
     
// });
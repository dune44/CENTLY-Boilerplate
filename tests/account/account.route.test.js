/* 
    supertest is used for convention not suggestion as 
    I am going to use 'request' for api testing.

*/
const supertest = require('supertest');
const expect = require('chai').expect;
const app = require("../../bin/app");
const accountSchema = require('../../schema/account.schema');

before( () => {
    accountSchema.deleteMany();
});

describe('Account Route /api/account', () =>{

});

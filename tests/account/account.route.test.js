/* 
    supertest is used for convention not suggestion as 
    I am going to use 'request' for api testing.

*/
const supertest = require('supertest');
const expect = require('chai').expect;
const app = require("../../bin/app");
const accountSchema = require('../../schema/account.schema');

before( () => {
});

describe('Account Route /api/account', () =>{
    describe('GET', async () => {

    });
    describe('POST', async () => {

    });
    describe('PUT', async () => {

    });
    describe('DELETE', async () => {

    });
});

describe('Account Route /api/account/login', () =>{
    describe('POST', async () => {

    });
});

const secretPhraseGenerator = require('./../../lib/secretPhraseGenerator/index');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const expect = chai.expect;

chai.use(dirtyChai);

describe( 'Test secretPhraseGenerator library', () => {

    let secretResult6Word,
        secretResult8Word,
        secretResult10Word,
        secretResult13Word;

    function getSecretPhrase( wordCount, next ){
        secretPhraseGenerator( wordCount, ( secretPhrase ) => {
            next( secretPhrase );
        });
    }

    describe( 'Get phrase with 6 words.', () => {


        before( ( done ) => {
            getSecretPhrase( 6, ( result ) => {
                secretResult6Word = result;
                done();
            });
        });
      
        after( done => done() );
      
        // Property Type
        it( 'secretResult6Word should be a string', () => {
           expect( secretResult6Word ).to.be.a( 'string' );
        });

        // Return Value
        it( 'secretResult6Word should have 6 words.', () => {
            const wordCount = secretResult6Word.split(' ');
            expect( wordCount.length ).to.equal( 6 );
        });

    });

    describe( 'Get phrase with 8 words.', () => {

        before( ( done ) => {
            getSecretPhrase( 8, ( result ) => {
                secretResult8Word = result;
                done();
            });
        });
      
        after( done => done() );
      
        // Property Type
        it( 'secretResult8Word should be a string', () => {
           expect( secretResult8Word ).to.be.a( 'string' );
        });

        // Return Value
        it( 'secretResult8Word should have 8 words.', () => {
            const wordCount = secretResult8Word.split(' ');
            expect( wordCount.length ).to.equal( 8 );
        });

    });

    describe( 'Get phrase with 10 words.', () => {

        before( ( done ) => {
            getSecretPhrase( 10, ( result ) => {
                secretResult10Word = result;
                done();
            });
        });
      
        after( done => done() );
      
        // Property Type
        it( 'secretResult10Word should be a string', () => {
           expect( secretResult10Word ).to.be.a( 'string' );
        });

        // Return Value
        it( 'secretResult10Word should have 10 words.', () => {
            const wordCount = secretResult10Word.split(' ');
            expect( wordCount.length ).to.equal( 10 );
        });

    });

    describe( 'Get phrase with 13 words.', () => {

        before( ( done ) => {
            getSecretPhrase( 13, ( result ) => {
                secretResult13Word = result;
                done();
            });
        });
      
        after( done => done() );
      
        // Property Type
        it( 'secretResult13Word should be a string', () => {
           expect( secretResult13Word ).to.be.a( 'string' );
        });

        // Return Value
        it( 'secretResult13Word should have 13 words.', () => {
            const wordCount = secretResult13Word.split(' ');
            expect( wordCount.length ).to.equal( 13 );
        });

    });

});
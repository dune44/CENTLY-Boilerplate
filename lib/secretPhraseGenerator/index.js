const fs = require('fs');
const path = require('path');

module.exports = ( wordCount, next ) => {
    fs.readFile( path.resolve(__dirname, 'words.txt'), "utf8", ( e, data) => {
        if( e ) {
            console.log( 'Problem reading file for secret phrase.');
            console.log( e );
        } else {
            const words = data.split('\n');
            let phrase = '';
            for( let i = 0; i < wordCount - 1; i++ ) {
                let index = Math.floor(Math.random() * Math.floor( data.length ));
                phrase += ( i < wordCount ) ? words[index] + ' ' : words[index];
            }
            next( phrase );
        }
    });
};
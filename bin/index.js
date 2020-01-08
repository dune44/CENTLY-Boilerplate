/*
    This is the main entry point file.
    We are checking that the env variables are available.
    Then we can bring in our express app variable.
    We then pass in the port & server info and fire listen on those.
*/
if(process.env.MONGODB_URL){
    const app = require("./app");
    app.set('port', process.env.PORT || 1337);
    app.set('address', process.env.ADDRESS || 'localhost');
    const server = app.listen(app.get('port'), app.get('address'), function () {
        console.log('Express server listening at http://%s:%s', server.address().address, server.address().port);
    });
}else{
    console.log('Mongo URI malformed');
}


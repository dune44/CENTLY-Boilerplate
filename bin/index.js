const app = require("./app");
app.set('port', process.env.PORT || 1337);
app.set('address', process.env.ADDRESS || 'localhost');
const server = app.listen(app.get('port'), app.get('address'), function () {
    console.log('Express server listening at http://%s:%s', server.address().address, server.address().port);
});
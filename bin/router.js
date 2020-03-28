/*
    wire up a simple place to add all of your route files 
    and pass them your app variable from Express.
*/

module.exports = (app) => {
    require('./routes/account.router')(app);
};
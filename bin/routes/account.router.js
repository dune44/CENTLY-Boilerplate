const auth = require('../../middleware/auth');

const accountRoutes = (app) => {
    /*
        Account Read
        Will return one users account info.
    */
    app.get('/api/account', async (req, res) => {
        res.status(400).send('route not written.');
    });

    /*
        Account Creation
        Expects Username, Password and Email
    */
    app.post('/api/account', async (req, res) => {
        res.status(400).send('route not written.');
    });

    // Auth user updates account here.
    app.put('/api/account', auth, async (req, res) => {
        res.status(400).send('route not written.');
    });

    // Auth user can soft delete account here.
    app.delete('/api/account', auth, async (req, res) => {
        res.status(400).send('route not written.');
    });

    /*
        Login
        Expects username and password.
    */
    app.post('/api/account/login', async (req, res) => {
        res.status(400).send('route not written.');
    });
}
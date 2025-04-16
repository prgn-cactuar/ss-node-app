// Libraries
const express = require('express');
const router = express.Router();

const authRoute = require('./auth.route');
const userRoute = require('./user.route');


module.exports = (app) => {
    authRoute(router);
    userRoute(router);

    app.use('/api', router);
};
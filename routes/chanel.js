const express = require('express');
const  routes=express.Router();
const {  subscribeChannel, unsubscribeChannel, getChanelDetails } = require('../controllers/channel');
const auth = require('../middleware/auth');



routes.patch('/subscribe/:chanelId',auth,subscribeChannel)
routes.patch('/unsubscribe/:chanelId',auth,unsubscribeChannel);
routes.get('/chanelDetails/:chanelId',auth,getChanelDetails);

module.exports = routes;
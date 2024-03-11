const express = require('express');
const routes = express.Router();


const {updateChanelData, getAllChannels} = require('../controllers/channel');
const {loginWithGoogle, login, signUp, getUserDetails} = require('../controllers/auth');
const auth = require('../middleware/auth');

routes.post('/signup',signUp);
routes.post('/loginWithGoogle',loginWithGoogle);
routes.post('/login',login);
routes.patch('/update/:id', updateChanelData);
routes.get('/getAllChanels', getAllChannels);
routes.get('/getUserDetails',auth,getUserDetails);

module.exports = routes;

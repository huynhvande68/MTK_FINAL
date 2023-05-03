const express = require('express');
const app = express.Router();
app.use(express.urlencoded());
const homeController = require('../controllers/homeController')

app.get('/logout', homeController.getLogout )
app.get('/login' ,homeController.getLogin);
app.post('/login', homeController.postLogin);
app.get('/register', homeController.getRegister);
app.post('/register',homeController.postRegister);

module.exports = app
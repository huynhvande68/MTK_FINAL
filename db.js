const {HOST, USER, PASSWORD, DATABASE} = process.env;

const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: null,
    database: 'nodejs',
});
module.exports = connection;
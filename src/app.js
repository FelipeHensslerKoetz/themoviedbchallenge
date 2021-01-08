const dotenv = require('dotenv').config();
const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');
app.API_KEY = '005dde095c890aa7e36b38b90fef847a';
app.db = knex(knexfile[process.env.NODE_ENV]);

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.use((err, req, res, next) => {
  if (err.message === 'Request failed with status code 404') {
    return res.status(404).json({ message: err.message });
  }
  return res.status(400).json({ message: err.message });
});

module.exports = app;

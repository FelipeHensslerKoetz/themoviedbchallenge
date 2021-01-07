const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');

app.db = knex(knexfile[process.env.NODE_ENV]);

module.exports = app;

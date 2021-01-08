const express = require('express');

module.exports = (app) => {
  const mainRouter = express.Router();

  mainRouter.use('/movies', app.routes.movies);

  app.use('/v1', mainRouter);
};

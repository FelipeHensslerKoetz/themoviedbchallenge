const express = require('express');
const ValidationError = require('../errors/validation_error');
const LanguageValidationError = require('../errors/language_validation');
const { body, validationResult } = require('express-validator');

module.exports = (app) => {
  const router = express.Router();

  router.get('/:id', (req, res, next) => {
    let queryParams = {
      language: req.query.language,
      append_to_response: req.query.append_to_response,
    };

    const { id } = req.params;

    if (!Number.isInteger(parseInt(id)))
      throw new ValidationError('id must be an integer');

    if (LanguageValidationError(queryParams.language))
      queryParams.language = 'en-US';

    const valid_appends = [
      'videos',
      'images',
      'images,videos',
      'videos,images',
    ];

    if (!valid_appends.includes(queryParams.append_to_response))
      delete queryParams.append_to_response;

    app.services.movie
      .getMovieById(id, queryParams)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.get('/:id/translations', (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;

    if (!Number.isInteger(parseInt(id)))
      throw new ValidationError('id must be an integer');

    app.services.movie
      .getTranslationsByMovieId(id, language)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.post(
    '/',
    [
      body('id').isInt().withMessage('must be an integer'),
      body('backdrop_path')
        .optional()
        .isString()
        .withMessage('must be a string'),
      body('belongs_to_collection').optional(),
      body('budget')
        .optional()
        .isInt()
        .withMessage('budget must be an integer'),
      body('genres').optional().isArray().withMessage('must be an array'),
      body('homepage').optional().isString().withMessage('must be a string'),
      body('imdb_id')
        .optional()
        .isLength({ min: 9, max: 9 })
        .withMessage('length must be 9'),
      body('original_language')
        .optional()
        .isString()
        .withMessage('must be a string'),
      body('original_title')
        .optional()
        .isString()
        .withMessage('must be a string'),
      body('overview').optional().isString().withMessage('must be a string'),
      body('popularity')
        .optional()
        .isNumeric()
        .withMessage('must be an integer'),
      body('poster_path').optional(),
      body('production_companies')
        .optional()
        .isArray()
        .withMessage('must be an array'),
      body('production_countries')
        .optional()
        .isArray()
        .withMessage('must be an array'),
      body('release_date').optional().isDate().withMessage('must be a date'),
      body('revenue').optional().isInt().withMessage('must be an integer'),
      body('runtime').optional().isInt().withMessage('must be an integer'),
      body('spoken_languages')
        .optional()
        .isArray()
        .withMessage('must be an array'),
      body('status').optional().isString().withMessage('must be a string'),
      body('tagline').optional().isString().withMessage('must be a string'),
      body('title').optional().isString().withMessage('must be a string'),
      body('video').optional().isBoolean().withMessage('must be a boolean'),
      body('vote_average').optional().isNumeric().withMessage('muste a number'),
      body('vote_count').optional().isInt().withMessage('must be an integer'),
    ],
    (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty() || Array.isArray(req.body))
        throw new ValidationError(
          errors || [{ message: 'Body can not be an array' }]
        );

      app.services.movie
        .createMovie({ ...req.body })
        .then((result) => res.status(201).json(result))
        .catch((err) => {
          next(err);
        });
    }
  );

  router.post(
    '/translations',
    [
      body('id').isInt().withMessage('must be an integer'),
      body('translations').optional().isArray().withMessage('must be an array'),
    ],
    (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty() || Array.isArray(req.body))
        throw new ValidationError(
          errors || [{ message: 'Body can not be an array' }]
        );

      app.services.movie
        .createTranslation({ ...req.body })
        .then((result) => res.status(201).json(result))
        .catch((err) => next(err));
    }
  );

  return router;
};

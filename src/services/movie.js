const axios = require('axios');
const ValidationError = require('../errors/validation_error');
const MOVIE_BASE_PATH = 'https://api.themoviedb.org/3/movie';

module.exports = (app) => {
  const filterTransalations = (language, translations) => {
    const languageMatch = (obj) => {
      return (
        obj['iso_3166_1'] == language ||
        obj['iso_639_1'] == language ||
        obj['name'] == language ||
        obj['english_name'] == language
      );
    };

    try {
      const filteredArray = translations.translations.filter(languageMatch);
      if (filteredArray.length > 0) {
        return filteredArray[0];
      } else {
        return translations;
      }
    } catch (error) {
      return translations;
    }
  };

  const getMovieById = async (movieId, queryParams) => {
    const checkMovieDetails = await app
      .db('movie_details')
      .where({
        movie_tag: movieId,
        language: queryParams.language,
        append_to_response: queryParams.append_to_response || '',
      })
      .first();

    if (checkMovieDetails) return checkMovieDetails.movie_data;

    return axios
      .get(`${MOVIE_BASE_PATH}/${movieId}`, {
        params: { api_key: app.API_KEY, ...queryParams },
      })
      .then(async (result) => {
        const checkIfMovieExists = await app
          .db('movies')
          .where({ movie_tag: movieId })
          .first();

        if (checkIfMovieExists) {
          await app.db('movie_details').insert({
            language: queryParams.language,
            movie_id: checkIfMovieExists.id,
            movie_tag: result.data.id,
            movie_data: JSON.stringify(result.data),
            append_to_response: queryParams.append_to_response || '',
          });
        } else {
          await app.db.transaction(async (trans) => {
            const newMovieId = await app
              .db('movies')
              .insert(
                { movie_tag: result.data.id, indexed_by_moviedb: true },
                'id'
              );

            await app.db('movie_details').insert({
              language: queryParams.language,
              movie_id: parseInt(newMovieId[0]),
              movie_tag: result.data.id,
              movie_data: JSON.stringify(result.data),
              append_to_response: queryParams.append_to_response || '',
            });
          });
        }
        return result.data;
      });
  };

  const getTranslationsByMovieId = async (movieId, language) => {
    const translations = await app
      .db('movie_translations')
      .where({ movie_tag: movieId })
      .first();

    if (translations) {
      return language
        ? filterTransalations(language, translations.translations)
        : translations.translations;
    } else {
      return axios
        .get(`${MOVIE_BASE_PATH}/${movieId}`, {
          params: { api_key: app.API_KEY },
        })
        .then(async (result) => {
          let createdMovieId;

          const movieExists = await app
            .db('movies')
            .where({ movie_tag: result.data.id })
            .first();

          if (movieExists) {
            createdMovieId = movieExists.id;
          } else {
            await app.db.transaction(async (trans) => {
              const newMovieId = await app
                .db('movies')
                .insert(
                  { movie_tag: result.data.id, indexed_by_moviedb: true },
                  'id'
                );

              createdMovieId = parseInt(newMovieId[0]);

              await app.db('movie_details').insert({
                language: queryParams.language,
                movie_id: parseInt(newMovieId),
                movie_tag: result.data.id,
                movie_data: JSON.stringify(result.data),
                append_to_response: queryParams.append_to_response || '',
              });
            });
          }

          return axios
            .get(`${MOVIE_BASE_PATH}/${movieId}/translations`, {
              params: { api_key: app.API_KEY },
            })
            .then(async (returnedTranslation) => {
              await app.db('movie_translations').insert({
                movie_id: createdMovieId,
                movie_tag: returnedTranslation.data.id,
                translations: JSON.stringify(returnedTranslation.data),
              });

              return language
                ? filterTransalations(language, returnedTranslation.data)
                : returnedTranslation.data;
            });
        });
    }
  };

  const createMovie = async (payload) => {
    const body = { ...payload };

    const checkMovieDetails = await app
      .db('movie_details')
      .where({ movie_tag: body.id })
      .first();

    let movie_id = checkMovieDetails ? checkMovieDetails.movie_id : '';

    if (!checkMovieDetails) {
      const newMovie = await app
        .db('movies')
        .insert({ movie_tag: body.id, indexed_by_moviedb: true }, '*');
      movie_id = parseInt(newMovie[0].id);
    }

    const newMovieDetails = await app.db('movie_details').insert(
      {
        movie_tag: body.id,
        movie_id: movie_id,
        movie_data: JSON.stringify(body),
      },
      '*'
    );
    return newMovieDetails[0].movie_data;
  };

  const createTranslation = async (payload) => {
    const body = { ...payload };

    const translations = await app
      .db('movie_translations')
      .where({ movie_tag: body.id })
      .first();

    if (translations)
      throw new ValidationError(
        'A translation already exist for the informed id'
      );

    const movieExists = await app
      .db('movies')
      .where({ movie_tag: body.id }, 'id')
      .first();

    let movieId = movieExists ? movieExists.id : '';

    if (!movieExists) {
      const newMovieId = await app
        .db('movies')
        .insert({ movie_tag: body.id, indexed_by_moviedb: true }, 'id');
      movieId = parseInt(newMovieId[0]);
    }

    axios
      .get(`${MOVIE_BASE_PATH}/${body.id}/translations`, {
        params: { api_key: app.API_KEY },
      })
      .then(async (returnedTranslation) => {
        await app.db('movie_translations').insert({
          movie_tag: body.id,
          movie_id: parseInt(movieId),
          translations: JSON.stringify(returnedTranslation.data),
        });

        return new ValidationError(
          'A translation already exist for the informed id'
        );
      });

    await app.db('movie_translations').insert({
      movie_tag: body.id,
      movie_id: parseInt(movieId),
      translations: JSON.stringify(body),
    });

    return body;
  };

  return {
    getMovieById,
    getTranslationsByMovieId,
    createMovie,
    createTranslation,
  };
};

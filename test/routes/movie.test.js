const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/movies';

beforeAll(async () => {
  await app.db('movie_details').del();
  await app.db('movie_translations').del();
  await app.db('movies').del();
});

describe('When searching for a movie', () => {
  test('I must return a movie by ID and save it in the database', async () => {
    return request(app)
      .get(`${MAIN_ROUTE}/500`)
      .then(async (res) => {
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
        expect(res.body.id).toBe(500);
        const movie = await app
          .db('movie_details')
          .where({ movie_tag: 500, language: 'en-US', append_to_response: '' });
        expect(movie).toHaveLength(1);
      });
  });

  test('I must return the movie_details already in the database, to the same language, and not create it again', async () => {
    return request(app)
      .get(`${MAIN_ROUTE}/500`)
      .then(async (res) => {
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
        expect(res.body.id).toBe(500);
        const movie = await app
          .db('movie_details')
          .where({ movie_tag: 500, language: 'en-US', append_to_response: '' });
        expect(movie).toHaveLength(1);
      });
  });

  test('I must not accept a non-numeric id', async () => {
    return request(app)
      .get(`${MAIN_ROUTE}/ABC`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(typeof res.body).toBe('object');
        expect(res.body.message).toBe('id must be an integer');
      });
  });

  test('I must return status 404 for non-existent ids', async () => {
    return request(app)
      .get(`${MAIN_ROUTE}/-1`)
      .then((res) => {
        expect(res.body.message).toBe('Request failed with status code 404');
        expect(res.status).toBe(404);
      });
  });

  test('I must perform a seach filtering by language', async () => {
    return request(app)
      .get(`${MAIN_ROUTE}/500`)
      .query({ language: 'pt-BR' })
      .then(async (res) => {
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
        expect(res.body.id).toBe(500);
        const movie = await app
          .db('movie_details')
          .where({ movie_tag: 500, language: 'pt-BR' });
        expect(movie).toHaveLength(1);
      });
  });

  test('I must assume en-US as the default language', async () => {
    return request(app)
      .get(`${MAIN_ROUTE}/500`)
      .query({ language: 'random' })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
      });
  });

  test('I must perform a search filtering by append_response', async () => {
    return request(app)
      .get(`${MAIN_ROUTE}/500`)
      .query({ append_to_response: 'videos,images' })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
      });
  });

  test('I must handle an invalid append_response', async () => {
    return request(app)
      .get(`${MAIN_ROUTE}/400`)
      .query({ language: 'en-US', append_to_response: 'wrongappend' })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
      });
  });
});

describe('When searching for translations', () => {
  test('I must return the translation of the movie by id and persist in the database', () => {
    return request(app)
      .get(`${MAIN_ROUTE}/500/translations`)
      .then(async (res) => {
        expect(res.status).toBe(200);
        const translations = await app
          .db('movie_translations')
          .where({ movie_tag: 500 });
        expect(translations).toHaveLength(1);
      });
  });

  test('I must return the persisted translation in the database', () => {
    return request(app)
      .get(`${MAIN_ROUTE}/500/translations`)
      .then(async (res) => {
        expect(res.status).toBe(200);
        const translations = await app
          .db('movie_translations')
          .where({ movie_tag: 500 });
        expect(translations).toHaveLength(1);
      });
  });

  test('I must not accept a non-numeric id', () => {
    return request(app)
      .get(`${MAIN_ROUTE}/abc/translations`)
      .then(async (res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('id must be an integer');
      });
  });

  test('I must return 404 status when the movie does not exist', () => {
    return request(app)
      .get(`${MAIN_ROUTE}/-1/translations`)
      .then(async (res) => {
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Request failed with status code 404');
      });
  });

  test('I must filter the lengenda by the optional param language', () => {
    return request(app)
      .get(`${MAIN_ROUTE}/500/translations`)
      .query({ language: 'pt' })
      .then(async (res) => {
        expect(res.status).toBe(200);
        const translations = await app
          .db('movie_translations')
          .where({ movie_tag: 500 });
        expect(translations).toHaveLength(1);
      });
  });
});

describe('When registering a movie_detail', () => {
  test('I must not accept a non numeric-id', () => {
    return request(app)
      .post(MAIN_ROUTE)
      .send({ id: null })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(typeof res.body.message).toBe('object');
        expect(res.body.message.errors.length).toBeGreaterThan(0);
      });
  });

  test('I must create a new movie_transalation', () => {
    return request(app)
      .post(MAIN_ROUTE)
      .send({ id: 1 })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: 1 });
      });
  });
});

describe('When registering a movie_translation', () => {
  test('I must not accape a non-numeric id', () => {
    return request(app)
      .post(`${MAIN_ROUTE}/translations`)
      .send({})
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message.errors.length).toBeGreaterThan(0);
      });
  });

  test('I must no register a translation if another one exists', () => {
    return request(app)
      .post(`${MAIN_ROUTE}/translations`)
      .send({ id: 500 })
      .then((res) => {
        expect(res.body.message).toBe(
          'A translation already exist for the informed id'
        );
        expect(res.status).toBe(400);
      });
  });

  test('I must add a new translation', () => {
    return request(app)
      .post(`${MAIN_ROUTE}/translations`)
      .send({ id: 1 })
      .then((res) => {
        expect(res.status).toBe(201);
      });
  });
});

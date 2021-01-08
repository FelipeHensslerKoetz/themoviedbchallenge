# themoviedbchallenge

The Movie DB Challenge provides a simple api to search/save movies details and translations. The indexing is based on a "movie_id" of the webiste https://developers.themoviedb.org/, it it don't returns any data, the id is abalible for manual creation.

Initial setup:

- docker build -t movie-db-node-docker/node .

- docker-compose up

- docker exec -ti api /bin/bash

- node node_modules/.bin/knex migrate:latest --env prod

- acess localhost:3000

  * Routes (see Documentation)
  * GET /v1/movies/{movieId}
  * GET /v1/movies/{movieId}/translations
  * POST /v1/movies
  * POST /v1/movies/translations


Documentation (neeeds npx):

- cd docs
- npx serve
- Acess localhost:5000

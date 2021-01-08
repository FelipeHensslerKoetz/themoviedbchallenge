module.exports = {
  test: {
    client: 'pg',
    version: '9.6',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'root',
      database: 'moviedbtest',
    },
    migrations: {
      directory: 'src/migrations',
    },
    seeds: {
      directory: 'src/seeds',
    },
  },
  prod: {
    client: 'pg',
    version: '9.6',
    connection: {
      host: 'database',
      user: 'postgres',
      password: 'postgres',
      database: 'moviedb',
    },
    migrations: {
      directory: 'src/migrations',
    },
    seeds: {
      directory: 'src/seeds',
    },
  },
};

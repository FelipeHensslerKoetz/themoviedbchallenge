exports.up = (knex) => {
  return knex.schema.createTable('movies', (t) => {
    t.increments('id').primary();
    t.integer('movie_tag').notNull().unique();
    t.boolean('indexed_by_moviedb').notNull();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('movies');
};

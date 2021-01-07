exports.up = (knex) => {
  return knex.schema.createTable('translations', (t) => {
    t.increments('id').primary();
    t.integer('movie_id').notNull();
    t.jsonb('translations').notNull();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('translations');
};

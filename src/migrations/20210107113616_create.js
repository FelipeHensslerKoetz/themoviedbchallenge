exports.up = (knex) => {
  return knex.schema.createTable('movie_translations', (t) => {
    t.increments('id').primary();
    t.integer('movie_id').references('id').inTable('movies').unique().notNull();
    t.integer('movie_tag').notNull();
    t.jsonb('translations').notNull();
    t.string('append_to_response').notNull().default('');
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('movie_translations');
};

exports.up = (knex) => {
  return knex.schema.createTable('movie_details', (t) => {
    t.increments('id').primary();
    t.integer('movie_id').references('id').inTable('movies').notNull();
    t.integer('movie_tag').notNull();
    t.jsonb('movie_data').notNull();
    t.string('language').notNull().default('en-US');
    t.string('append_to_response').notNull().default('');
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('movie_details');
};

exports.up = (knex) => {
  return knex.schema.createTable('movies', (t) => {
    t.increments('id').primary(),
      t.integer('movie_id').notNull(),
      t.jsonb('movie_data').notNull(),
      t.string('language').notNull().default('en-US');
    t.string('append_to_response').notNull().default('');
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('movies');
};

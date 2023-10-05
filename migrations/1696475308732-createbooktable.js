exports.up = (pgm) => {
  pgm.createTable("books", {
    id: { type: "bytea", primaryKey: true },
    name: { type: "varchar(255)", notNull: true },
    description: { type: "text", notNull: true },
    expense: { type: "numeric", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: { type: "timestamp" },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("books");
};

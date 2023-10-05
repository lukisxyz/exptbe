exports.up = (pgm) => {
  pgm.createTable("categories", {
    id: { type: "bytea", primaryKey: true },
    name: { type: "varchar(255)", notNull: true },
    description: { type: "text", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: { type: "timestamp" },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("categories");
};

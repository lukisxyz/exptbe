exports.up = (pgm) => {
  pgm.createTable("records", {
    id: { type: "bytea", primaryKey: true },
    note: { type: "varchar(255)", notNull: true },
    amount: { type: "numeric", notNull: true },
    category_id: { type: "bytea", notNull: true, reference: "categories(id)" },
    book_id: {
      type: "bytea",
      notNull: true,
      reference: "books(id)",
      onDelete: "cascade",
    },
    is_expense: { type: "boolean", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: { type: "timestamp" },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("records");
};

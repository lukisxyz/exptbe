import { Pool } from "pg";
import { ulid } from "ulid";

export interface BookRepository {
  ID: string;
  Name: string;
  Description: string;
  Expense: number;
  CreatedAt: Date;
  UpdatedAt: Date | null;
}

export class PostgresBookRepository implements BookRepository {
  ID: string;
  Name: string;
  Description: string;
  Expense: number;
  CreatedAt: Date;
  UpdatedAt: Date | null;

  private static pool: Pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "test",
    password: "password",
    port: 5433,
  });

  constructor(Name: string, Description: string, Expense: number) {
    this.ID = ulid();
    this.Name = Name;
    this.Description = Description;
    this.Expense = Expense;
    this.CreatedAt = new Date();
    this.UpdatedAt = null;
  }

  async Save() {
    const client = await PostgresBookRepository.pool.connect();
    try {
      const result = await client.query(
        "INSERT INTO books (id, name, description, expense, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [this.ID, this.Name, this.Description, this.Expense, this.CreatedAt]
      );
      this.ID = result.rows[0].id;
      return this;
    } finally {
      client.release();
    }
  }

  static async GetByID(id: string): Promise<BookRepository | null> {
    const client = await PostgresBookRepository.pool.connect();
    try {
      const result = await client.query("SELECT * FROM books WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      const book: BookRepository = {
        ID: row.id.toString(),
        Name: row.name,
        Description: row.description,
        Expense: row.expense,
        CreatedAt: row.created_at,
        UpdatedAt: row.updated_at,
      };
      return book;
    } finally {
      client.release();
    }
  }

  static async Fetch(
    cursor: String,
    pageSize: number
  ): Promise<{ next: string; total: number; data: BookRepository[] }> {
    const client = await PostgresBookRepository.pool.connect();
    try {
      const countQueryResult = await client.query(
        "SELECT COUNT(id) as cnt FROM books"
      );
      const count = parseInt(countQueryResult.rows[0].cnt);
      const result = await client.query(
        "SELECT * FROM books WHERE id > $1  ORDER BY id LIMIT $2",
        [cursor, pageSize]
      );
      let nextCursor = "";
      if (result.rows.length == pageSize) {
        nextCursor = result.rows[pageSize - 1].id.toString();
      }
      const res = result.rows.map((row) => {
        const book: BookRepository = {
          ID: row.id.toString(),
          Name: row.name,
          Description: row.description,
          Expense: row.expense,
          CreatedAt: row.created_at,
          UpdatedAt: row.updated_at,
        };
        return book;
      });
      return {
        data: res,
        next: nextCursor,
        total: count,
      };
    } finally {
      client.release();
    }
  }
}

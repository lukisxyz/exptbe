import { Pool } from "pg";
import { ulid } from "ulid";
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from "../types/response-helper";
import { CategoryRepository } from "./category-repository";
import { BookRepository } from "./book-repository";

export interface RecordRepository {
  ID: string;
  Note: string;
  CategoryID: string;
  Category: CategoryRepository | null;
  BookID: string;
  Book: BookRepository | null;
  Amount: number;
  IsExpense: boolean;
  CreatedAt: Date;
  UpdatedAt: Date | null;
}

export class PostgresRecordRepository implements RecordRepository {
  ID: string;
  Note: string;
  CategoryID: string;
  Category: CategoryRepository | null;
  BookID: string;
  Book: BookRepository | null;
  Amount: number;
  IsExpense: boolean;
  CreatedAt: Date;
  UpdatedAt: Date | null;

  private static pool: Pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "test",
    password: "password",
    port: 5433,
  });

  constructor(
    ID: string | null,
    Note: string,
    CategoryID: string,
    BookID: string,
    Amount: number,
    IsExpense: boolean
  ) {
    this.ID = ID ? ID : ulid();
    this.Note = Note;
    this.CategoryID = CategoryID;
    this.Category = null;
    this.BookID = BookID;
    this.Book = null;
    this.Amount = Amount;
    this.IsExpense = IsExpense;
    this.CreatedAt = new Date();
    this.UpdatedAt = null;
  }

  async Save() {
    const client = await PostgresRecordRepository.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO records
          (id, note, category_id, book_id, amount, is_expense, created_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT
          (id)
        DO UPDATE
          SET note = EXCLUDED.note,
          category_id = EXCLUDED.category_id,
          book_id = EXCLUDED.book_id,
          amount = EXCLUDED.amount,
          is_expense = EXCLUDED.is_expense,
          updated_at = $8
        RETURNING id`,
        [
          this.ID,
          this.Note,
          this.CategoryID,
          this.BookID,
          this.Amount,
          this.IsExpense,
          this.CreatedAt,
          new Date(),
        ]
      );
      this.ID = result.rows[0].id;
      return this;
    } finally {
      client.release();
    }
  }

  static async GetByID(id: string): Promise<ApiResponse<RecordRepository>> {
    const client = await PostgresRecordRepository.pool.connect();
    try {
      const result = await client.query(
        `SELECT
          r.id as r_id,
          r.note as r_note,
          r.amount as r_amount,
          r.created_at as r_created_at,
          r.updated_at as r_updated_at,
          r.is_expense as r_is_expense,
          r.book_id as r_book_id,
          r.category_id as r_category_id,
          c.id as c_id,
          c.name as c_name,
          c.description as c_description,
          c.created_at as c_created_at,
          c.updated_at as c_updated_at,
          b.id as b_id,
          b.name as b_name,
          b.expense as b_expense,
          b.description as b_description,
          b.created_at as b_created_at,
          b.updated_at as b_updated_at
        FROM records r
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN books b ON r.book_id = b.id
        WHERE r.id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return createErrorResponse(
          404,
          new Error(`record with id ${id} not found`)
        );
      }
      const row = result.rows[0];
      const record: RecordRepository = {
        ID: row.r_id.toString(),
        Note: row.r_note,
        CategoryID: row.r_category_id.toString(),
        Category: {
          ID: row.c_id.toString(),
          Name: row.c_name,
          Description: row.c_description,
          CreatedAt: row.c_created_at,
          UpdatedAt: row.c_updated_at,
        },
        BookID: row.r_book_id.toString(),
        Book: {
          ID: row.b_id.toString(),
          Name: row.b_name,
          Expense: row.b_expense,
          Description: row.b_description,
          CreatedAt: row.b_created_at,
          UpdatedAt: row.b_updated_at,
        },
        Amount: row.r_amount,
        IsExpense: row.r_is_expense,
        CreatedAt: row.r_created_at,
        UpdatedAt: row.r_updated_at,
      };
      return createSuccessResponse(200, record);
    } catch (err) {
      return createErrorResponse(500, new Error("internal server error"));
    } finally {
      client.release();
    }
  }

  static async Fetch(
    cursor: string,
    pageSize: number
  ): Promise<
    ApiResponse<{ next: string; total: number; data: RecordRepository[] }>
  > {
    const client = await PostgresRecordRepository.pool.connect();
    try {
      const countQueryResult = await client.query(
        "SELECT COUNT(id) as cnt FROM records"
      );
      const count = parseInt(countQueryResult.rows[0].cnt);
      const result = await client.query(
        `SELECT
          r.id as r_id,
          r.note as r_note,
          r.amount as r_amount,
          r.created_at as r_created_at,
          r.updated_at as r_updated_at,
          r.is_expense as r_is_expense,
          r.book_id as r_book_id,
          r.category_id as r_category_id,
          c.id as c_id,
          c.name as c_name,
          c.description as c_description,
          c.created_at as c_created_at,
          c.updated_at as c_updated_at,
          b.id as b_id,
          b.name as b_name,
          b.expense as b_expense,
          b.description as b_description,
          b.created_at as b_created_at,
          b.updated_at as b_updated_at
        FROM records r
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN books b ON r.book_id = b.id
        WHERE r.id > $1
        ORDER BY r.id
        LIMIT $2`,
        [cursor, pageSize]
      );
      let nextCursor = "";
      if (result.rows.length === pageSize) {
        nextCursor = result.rows[pageSize - 1].id.toString();
      }
      const res = result.rows.map((row) => {
        const record: RecordRepository = {
          ID: row.r_id.toString(),
          Note: row.r_note,
          CategoryID: row.r_category_id.toString(),
          Category: {
            ID: row.c_id.toString(),
            Name: row.c_name,
            Description: row.c_description,
            CreatedAt: row.c_created_at,
            UpdatedAt: row.c_updated_at,
          },
          BookID: row.r_book_id.toString(),
          Book: {
            ID: row.b_id.toString(),
            Name: row.b_name,
            Expense: row.b_expense,
            Description: row.b_description,
            CreatedAt: row.b_created_at,
            UpdatedAt: row.b_updated_at,
          },
          Amount: row.r_amount,
          IsExpense: row.r_is_expense,
          CreatedAt: row.r_created_at,
          UpdatedAt: row.r_updated_at,
        };
        return record;
      });
      return createSuccessResponse(200, {
        data: res,
        next: nextCursor,
        total: count,
      });
    } catch (err) {
      return createErrorResponse(500, new Error("internal server error"));
    } finally {
      client.release();
    }
  }
}

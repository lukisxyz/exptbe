import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PostgresBookRepository } from "./domain/books/Repository";
import kill from "kill-port";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/books", async (req: Request, res: Response) => {
  try {
    let cursor = req.query.cursor;
    let limit = req.query.limit;
    const books = await PostgresBookRepository.Fetch(
      String(cursor),
      Number(limit)
    );
    res.status(200).send({
      message: "found data",
      data: books.data,
      meta: {
        next: books.next,
        limit: limit,
        total: books.total,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      data: null,
    });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

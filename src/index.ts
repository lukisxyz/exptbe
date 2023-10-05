import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { PostgresBookRepository } from "./domain/books/Repository";
import { PostgresCategoryRepository } from "./domain/categories/Repository";

dotenv.config();

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/book", async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    res.status(405).send({
      message: "method not allowed",
    });
  }
  try {
    if (!req.body.name || !req.body.description) {
      res.status(400).send({
        message: "input false",
      });
    }
    let name = req.body.name;
    let description = req.body.description;
    const newBook = new PostgresBookRepository(null, name, description, 0);
    await newBook.Save();

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
    });
  }
});

app.patch("/book/:id", async (req: Request, res: Response) => {
  if (req.method !== "PATCH") {
    res.status(405).send({
      message: "method not allowed",
    });
  }
  try {
    let id = req.params.id;
    if (!req.body.name || !req.body.description || !req.body.expense) {
      res.status(400).send({
        message: "input false",
      });
    }
    let name = req.body.name;
    let description = req.body.description;
    let expense = req.body.expense;
    const newBook = new PostgresBookRepository(id, name, description, expense);
    await newBook.Save();

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
    });
  }
});

app.get("/book", async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    res.status(405).send({
      message: "method not allowed",
    });
  }
  try {
    let cursor = req.query.cursor;
    let limit = req.query.limit;
    const resp = await PostgresBookRepository.Fetch(
      String(cursor),
      Number(limit)
    );
    if (resp.status === 200 || resp.status === 201) {
      res.status(resp.status).send({
        data: resp.data.data,
        meta: {
          per_page: limit,
          next: resp.data.next,
          total_data: resp.data.total,
        },
      });
    } else {
      res.status(resp.status).send(resp);
    }
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
    });
  }
});

app.get("/book/:id", async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    res.status(405).send({
      message: "method not allowed",
    });
  }
  try {
    let id = req.params.id;
    const books = await PostgresBookRepository.GetByID(String(id));
    res.status(200).send({
      message: "found book",
      data: books,
      meta: {},
    });
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      data: null,
    });
  }
});

app.get("/category", async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    res.status(405).send({
      message: "method not allowed",
    });
  }
  try {
    let cursor = req.query.cursor;
    let limit = req.query.limit;
    const resp = await PostgresCategoryRepository.Fetch(
      String(cursor),
      Number(limit)
    );
    if (resp.status === 200 || resp.status === 201) {
      res.status(resp.status).send({
        data: resp.data.data,
        meta: {
          per_page: limit,
          next: resp.data.next,
          total_data: resp.data.total,
        },
      });
    } else {
      res.status(resp.status).send(resp);
    }
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
    });
  }
});

app.get("/category/:id", async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    res.status(405).send({
      message: "method not allowed",
    });
  }
  try {
    let id = req.params.id;
    const books = await PostgresCategoryRepository.GetByID(String(id));
    res.status(200).send({
      message: "found category",
      data: books,
      meta: {},
    });
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      data: null,
    });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

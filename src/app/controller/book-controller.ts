import { Request, Response } from "express";
import { PostgresBookRepository } from "../../domain/book-repository";

export async function createBook(req: Request, res: Response) {
  try {
    const name = req.body.name;
    const description = req.body.description;
    if (!name) {
      res.status(400).send({
        message: "missing name",
      });
    }
    if (!description) {
      res.status(400).send({
        message: "missing description",
      });
    }
    const newBook = new PostgresBookRepository(null, name, description, 0);
    await newBook.Save();

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
    });
  }
}

export async function updateBook(req: Request, res: Response) {
  try {
    const name = req.body.name;
    const description = req.body.description;
    const expense = req.body.expense;
    if (!name) {
      res.status(400).send({
        message: "missing name",
      });
    }
    if (!description) {
      res.status(400).send({
        message: "missing description",
      });
    }
    if (!expense) {
      res.status(400).send({
        message: "missing expense",
      });
    }
    const id = req.params.id;
    const newBook = new PostgresBookRepository(id, name, description, expense);
    await newBook.Save();
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      error: error,
    });
  }
}

export async function fetchData(req: Request, res: Response) {
  try {
    let cursor = req.query.cursor;
    let limit = req.query.limit;
    if (!limit) {
      res.status(400).send({
        message: "missing query params limit",
      });
    }
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
      error: error,
    });
  }
}

export async function getByID(req: Request, res: Response) {
  try {
    let id = req.params.id;
    const resp = await PostgresBookRepository.GetByID(String(id));
    if (resp.status === 200 || resp.status === 201) {
      res.status(resp.status).send({
        message: "found category",
        data: resp.data,
      });
    } else {
      res.status(resp.status).send({
        message: "not found category",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      error: error,
    });
  }
}

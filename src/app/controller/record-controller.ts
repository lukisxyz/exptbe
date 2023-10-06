import { Request, Response } from "express";
import { PostgresRecordRepository } from "../../domain/record-repository";

export async function createRecord(req: Request, res: Response) {
  try {
    const { note, amount, category_id, book_id, is_expense } = req.body;
    if (!amount) {
      res.status(400).send({
        message: "missing amount",
      });
    }
    if (!note) {
      res.status(400).send({
        message: "missing note",
      });
    }
    if (!category_id) {
      res.status(400).send({
        message: "missing category_id",
      });
    }
    if (!book_id) {
      res.status(400).send({
        message: "missing book_id",
      });
    }
    let expense = is_expense ? true : false;
    const newRecord = new PostgresRecordRepository(
      null,
      note,
      category_id,
      book_id,
      amount,
      expense
    );
    await newRecord.Save();

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      error: error,
    });
  }
}

export async function updateRecord(req: Request, res: Response) {
  try {
    const { note, amount, category_id, book_id, is_expense } = req.body;
    if (!amount) {
      res.status(400).send({
        message: "missing amount",
      });
    }
    if (!note) {
      res.status(400).send({
        message: "missing note",
      });
    }
    if (!category_id) {
      res.status(400).send({
        message: "missing category_id",
      });
    }
    if (!book_id) {
      res.status(400).send({
        message: "missing book_id",
      });
    }
    let expense = is_expense ? true : false;
    let id = req.params.id;
    const newRecord = new PostgresRecordRepository(
      id,
      note,
      category_id,
      book_id,
      amount,
      expense
    );
    await newRecord.Save();
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
    if (!req.query.limit) {
      res.status(400).send({
        message: "missing query params limit",
      });
    }
    let cursor = req.query.cursor;
    let limit = req.query.limit;
    const resp = await PostgresRecordRepository.Fetch(
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
    const resp = await PostgresRecordRepository.GetByID(String(id));
    if (resp.status === 200 || resp.status === 201) {
      res.status(resp.status).send({
        message: "found record",
        data: resp.data,
      });
    } else {
      res.status(resp.status).send({
        message: "not found record",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      error: error,
    });
  }
}

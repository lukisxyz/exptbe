import { Request, Response } from "express";
import { PostgresCategoryRepository } from "../../domain/category-repository";

export async function createCategory(req: Request, res: Response) {
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
    const newBook = new PostgresCategoryRepository(null, name, description);
    await newBook.Save();

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      error: error,
    });
  }
}

export async function updateCategory(req: Request, res: Response) {
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
    let id = req.params.id;
    const newBook = new PostgresCategoryRepository(id, name, description);
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
      error: error,
    });
  }
}

export async function getByID(req: Request, res: Response) {
  try {
    let id = req.params.id;
    const resp = await PostgresCategoryRepository.GetByID(String(id));
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

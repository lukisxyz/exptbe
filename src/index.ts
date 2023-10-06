import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import {
  createBook,
  fetchData,
  getByID,
  updateBook,
} from "./app/controller/book-controller";
import {
  fetchData as fetchDataCategories,
  getByID as getByIDCategory,
  createCategory,
  updateCategory,
} from "./app/controller/category-controller";
import {
  fetchData as fetchDataRecords,
  getByID as getByIDRecord,
  createRecord,
  updateRecord,
} from "./app/controller/record-controller";
dotenv.config();

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Home Page");
});

app.post("/api/book", createBook);
app.patch("/api/book/:id", updateBook);
app.get("/api/book", fetchData);
app.get("/api/book/:id", getByID);

app.post("/api/category", createCategory);
app.patch("/api/category/:id", updateCategory);
app.get("/api/category", fetchDataCategories);
app.get("/api/category/:id", getByIDCategory);

app.post("/api/record", createRecord);
app.patch("/api/record/:id", updateRecord);
app.get("/api/record", fetchDataRecords);
app.get("/api/record/:id", getByIDRecord);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

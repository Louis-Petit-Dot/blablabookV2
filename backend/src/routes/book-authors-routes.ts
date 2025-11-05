import { Hono } from "hono";
import { authorBookController } from "../controllers/authorBookController.ts";

const bookAuthorRoutes = new Hono();

bookAuthorRoutes.get('/book/:id/authors', authorBookController.getBookAuthors);
bookAuthorRoutes.get('/author/:id/books', authorBookController.getAuthorBooks);

export default bookAuthorRoutes;
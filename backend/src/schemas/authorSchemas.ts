import { createInsertSchema } from "drizzle-zod";
import { Author } from "../models/author.ts";

const authorInsertSchema = createInsertSchema(Author);

export const authorCreateSchema = authorInsertSchema.omit({
    id_author: true
});
import { createInsertSchema } from "drizzle-zod";
import { Genre } from "../models/genre.ts";

const genreInsertSchema = createInsertSchema(Genre);

export const genreCreateSchema = genreInsertSchema.omit({
    id_genre: true
});
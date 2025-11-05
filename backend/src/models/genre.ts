import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core"

export const Genre = pgTable('GENRE', {

// je definis l'identifiant unique
    id_genre: uuid('id_genre').primaryKey().defaultRandom(),

// je definis les infos du genre
    genre_name: varchar('genre_name', {length: 100}).notNull().unique(),
    description: text('description'),

// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// j'export les types
export type GenreSelect = typeof Genre.$inferSelect;
export type GenreInsert = typeof Genre.$inferInsert;
import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core"

export const Book = pgTable('BOOK', {

// je definis l'identifiant unique
    id_book: uuid('id_book').primaryKey().defaultRandom(),

// je definis les infos du livre
    isbn: varchar('isbn', {length: 17}).unique(),
    openlibrary_key: varchar('openlibrary_key', {length: 50}).unique(),
    title: varchar('title', {length: 255}).notNull(),
    summary: text('summary'),
    nb_pages: integer('nb_pages'),
    publication_year: integer('publication_year'),
    language: varchar('language', {length: 5}).notNull().default('fr'),
    image: varchar('image', {length: 500}),

// je definis les metadonnees
    metadata: jsonb('metadata').default('{}'),

// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// j'export les types
export type BookSelect = typeof Book.$inferSelect;
export type BookInsert = typeof Book.$inferInsert;
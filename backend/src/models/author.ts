import { pgTable, uuid, varchar, text,  timestamp } from "drizzle-orm/pg-core"

export const Author = pgTable('AUTHOR', {

// je definis l'identifiant unique
    id_author: uuid('id_author').primaryKey().defaultRandom(),

// je definis les infos de l'auteur
    author_name: varchar('author_name', {length: 200}).notNull(),
    bio: text('bio'),    
    wikipedia_url: varchar('wikipedia_url', {length: 500}),

// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// j'export les types
export type AuthorSelect = typeof Author.$inferSelect;
export type AuthorInsert = typeof Author.$inferInsert;
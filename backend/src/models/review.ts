import { pgTable, uuid,  text, varchar, boolean, timestamp, unique } from "drizzle-orm/pg-core"
import { User } from "./user.ts"
import { Book } from "./book.ts"

export const Review = pgTable('REVIEW', {

// je definis l'identifiant unique
    id_review: uuid('id_review').primaryKey().defaultRandom(),

// je definis les relations
    id_user: uuid('id_user').notNull().references(() => User.id_user, { onDelete: 'cascade' }),
    id_book: uuid('id_book').notNull().references(() => Book.id_book, { onDelete: 'restrict' }),

// je definis les infos de la critique
    title: varchar('title', { length: 50 }).notNull(),
    comment: text('comment'),    
    is_public: boolean('is_public').notNull().default(false),
    is_spoiler: boolean('is_spoiler').notNull().default(false),

// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    published_at: timestamp('published_at', { withTimezone: true }),
}, (table) => {
    return {
        // contrainte d'unicite sur id_user et id_book
        userBookUnique: unique().on(table.id_user, table.id_book),
    }
});

// j'export les types
export type ReviewSelect = typeof Review.$inferSelect;
export type ReviewInsert = typeof Review.$inferInsert;
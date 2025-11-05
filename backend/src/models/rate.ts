import { pgTable, uuid, integer, timestamp, unique } from "drizzle-orm/pg-core"
import { User } from "./user.ts"
import { Book } from "./book.ts"

export const Rate = pgTable('RATE', {

// je definis l'identifiant unique
    id_rate: uuid('id_rate').primaryKey().defaultRandom(),

// je definis les relations
    id_user: uuid('id_user').notNull().references(() => User.id_user, { onDelete: 'cascade' }),
    id_book: uuid('id_book').notNull().references(() => Book.id_book, { onDelete: 'restrict' }),

// je definis la note
    rating: integer('rating').notNull(),

// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
    return {
        // contrainte d'unicite sur id_user et id_book
        userBookUnique: unique().on(table.id_user, table.id_book),
    }
});

// j'export les types
export type RateSelect = typeof Rate.$inferSelect;
export type RateInsert = typeof Rate.$inferInsert;
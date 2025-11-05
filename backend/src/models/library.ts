import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { User } from "./user.ts"

export const Library = pgTable('LIBRARY', {

// je definis l'identifiant unique
    id_library: uuid('id_library').primaryKey().defaultRandom(),

// je definis la relation vers l'utilisateur
    id_user: uuid('id_user').notNull().references(() => User.id_user, { onDelete: 'cascade' }),

// je definis les infos de la bibliotheque
    lib_name: varchar('lib_name', {length: 100}).notNull(),
    description: text('description'),
    is_public: boolean('is_public').notNull().default(false),

// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

// j'export les types
export type LibrarySelect = typeof Library.$inferSelect;
export type LibraryInsert = typeof Library.$inferInsert;
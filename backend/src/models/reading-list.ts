import { pgTable, uuid, varchar, text, boolean, timestamp, unique } from "drizzle-orm/pg-core"
import { User } from "./user.ts"
import { Library } from "./library.ts"

export const ReadingList = pgTable('READING_LIST', {

// je definis l'identifiant unique
    id_list: uuid('id_list').primaryKey().defaultRandom(),

// je definis les relations
    id_user: uuid('id_user').notNull().references(() => User.id_user, { onDelete: 'cascade' }),
    id_library: uuid('id_library').notNull().references(() => Library.id_library, { onDelete: 'cascade' }),

// je definis les infos de la liste de lecture
    list_name: varchar('list_name', {length: 100}).notNull(),
    description: text('description'),
    is_public: boolean('is_public').notNull().default(false),


// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
    return {
        // contrainte d'unicite sur id_user, id_library et list_name
        userLibraryListUnique: unique().on(table.id_user, table.id_library, table.list_name),
    }
});

// j'export les types
export type ReadingListSelect = typeof ReadingList.$inferSelect;
export type ReadingListInsert = typeof ReadingList.$inferInsert;
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core"

export const Role = pgTable('ROLE', {

// je definis l'identifiant unique
    id_role: uuid('id_role').primaryKey().defaultRandom(),

// je definis les infos du role
    role_name: varchar('role_name', {length: 50}).notNull().unique(),
    description: text('description').notNull(),

// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// j'export les types
export type RoleSelect = typeof Role.$inferSelect;
export type RoleInsert = typeof Role.$inferInsert;
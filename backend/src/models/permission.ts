import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core"

export const Permission = pgTable('PERMISSION', {

// je definis l'identifiant unique
    id_permission: uuid('id_permission').primaryKey().defaultRandom(),

// je definis les infos de la permission
    label: varchar('label', {length: 100}).notNull().unique(),
    action: varchar('action', {length: 255}),
    resource: varchar('resource', {length: 100}),

// je definis les timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// j'export les types
export type PermissionSelect = typeof Permission.$inferSelect;
export type PermissionInsert = typeof Permission.$inferInsert;
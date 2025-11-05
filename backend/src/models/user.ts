import { pgTable, uuid, varchar, timestamp, jsonb, } from "drizzle-orm/pg-core"

export const User = pgTable('USER', {

// je definis l'identifiant unique
    id_user: uuid('id_user').primaryKey().defaultRandom(),

//je definis les infos perso
    firstname: varchar('firstname',{length: 50}).notNull(),
    lastname: varchar('lastname',{length: 50}).notNull(),
    username: varchar('username' ,{length: 50}).notNull().unique(),
    email: varchar('email',{length: 255}).notNull().unique(),
    password: varchar('password',{length: 255}).notNull(),


//je definis les optionels
    avatar_url: varchar('avatar_url',{length: 500}),
    preferences: jsonb('preferences').default('{}'),

//je definis les timpestamps
    last_login: timestamp('last_login', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

//j'export les types
export type UserSelect = typeof User.$inferSelect;
export type UserInsert = typeof User.$inferInsert;
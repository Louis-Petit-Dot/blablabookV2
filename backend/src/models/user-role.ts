import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { User } from './user.ts';
import { Role } from './role.ts';

export const UserRole = pgTable('USER_ROLE', {
  id_user_role: uuid('id_user_role').primaryKey().defaultRandom(),
  id_user: uuid('id_user').notNull().references(() => User.id_user, { onDelete: 'cascade' }),
  id_role: uuid('id_role').notNull().references(() => Role.id_role, { onDelete: 'cascade' }),
  assigned_at: timestamp('assigned_at').notNull().defaultNow(),
  assigned_by: uuid('assigned_by').references(() => User.id_user, { onDelete: 'set null' }),
});

export const userRoleRelations = relations(UserRole, ({ one }) => ({
  user: one(User, {
    fields: [UserRole.id_user],
    references: [User.id_user],
  }),
  role: one(Role, {
    fields: [UserRole.id_role],
    references: [Role.id_role],
  }),
  assignedBy: one(User, {
    fields: [UserRole.assigned_by],
    references: [User.id_user],
  }),
}));

export type UserRoleSelect = typeof UserRole.$inferSelect;
export type UserRoleInsert = typeof UserRole.$inferInsert;
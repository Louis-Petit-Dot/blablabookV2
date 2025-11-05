import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Role } from './role.ts';
import { Permission } from './permission.ts';

export const RolePermission = pgTable('ROLE_PERMISSION', {
  id_role_permission: uuid('id_role_permission').primaryKey().defaultRandom(),
  id_role: uuid('id_role').notNull().references(() => Role.id_role, { onDelete: 'cascade' }),
  id_permission: uuid('id_permission').notNull().references(() => Permission.id_permission, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const rolePermissionRelations = relations(RolePermission, ({ one }) => ({
  role: one(Role, {
    fields: [RolePermission.id_role],
    references: [Role.id_role],
  }),
  permission: one(Permission, {
    fields: [RolePermission.id_permission],
    references: [Permission.id_permission],
  }),
}));

export type RolePermissionSelect = typeof RolePermission.$inferSelect;
export type RolePermissionInsert = typeof RolePermission.$inferInsert;
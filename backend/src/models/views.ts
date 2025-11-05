// =====================================================
// VIEWS - Modèles pour les vues SQL
// =====================================================

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

// Vue 1: user_role_view (pour getUserRoles et getRoleUsers)
export const UserRoleView = pgTable("user_role_view", {
    id_user: uuid("id_user").primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    firstname: varchar("firstname", { length: 50 }).notNull(),
    lastname: varchar("lastname", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    id_role: uuid("id_role").notNull(),
    role_name: varchar("role_name", { length: 50 }).notNull(),
    role_description: text("role_description").notNull(),
    assigned_at: timestamp("assigned_at").notNull(),
    assigned_by: uuid("assigned_by"),
    assigner_username: varchar("assigner_username", { length: 50 }),
    assigner_firstname: varchar("assigner_firstname", { length: 50 }),
    assigner_lastname: varchar("assigner_lastname", { length: 50 })
});

// Vue 2: role_permission_view (pour getUserPermissions)
export const RolePermissionView = pgTable("role_permission_view", {
    id_user: uuid("id_user").primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    firstname: varchar("firstname", { length: 50 }).notNull(),
    lastname: varchar("lastname", { length: 50 }).notNull(),
    id_role: uuid("id_role").notNull(),
    role_name: varchar("role_name", { length: 50 }).notNull(),
    assigned_at: timestamp("assigned_at").notNull(),
    id_permission: uuid("id_permission").notNull(),
    label: varchar("label", { length: 50 }).notNull(),
    action: varchar("action", { length: 255 }),
    resource: varchar("resource", { length: 100 })
});

// Vue 3: Permissions du rôle USER
export const UserRolePermissionsView = pgTable("user_role_permissions_view", {
    id_permission: uuid("id_permission").primaryKey(),
    label: varchar("label", { length: 50 }).notNull(),
    action: varchar("action", { length: 255 }),
    resource: varchar("resource", { length: 100 })
});

// Vue 4: Permissions du rôle ADMIN
export const AdminRolePermissionsView = pgTable("admin_role_permissions_view", {
    id_permission: uuid("id_permission").primaryKey(),
    label: varchar("label", { length: 50 }).notNull(),
    action: varchar("action", { length: 255 }),
    resource: varchar("resource", { length: 100 })
});

// Vue 5: Library avec jointures
export const LibraryView = pgTable("library_view", {
    id_library: uuid("id_library").primaryKey(),
    id_user: uuid("id_user").notNull(),
    lib_name: varchar("lib_name", { length: 100 }).notNull(),
    description: text("description"),
    is_public: boolean("is_public").notNull(),
    created_at: timestamp("created_at").notNull(),
    updated_at: timestamp("updated_at").notNull(),
    deleted_at: timestamp("deleted_at"),
    owner_username: varchar("owner_username", { length: 50 }).notNull(),
    owner_firstname: varchar("owner_firstname", { length: 50 }).notNull(),
    owner_lastname: varchar("owner_lastname", { length: 50 }).notNull(),
    user_deleted_at: timestamp("user_deleted_at")
});

// Vue 6: ReadingList avec jointures
export const ReadingListView = pgTable("reading_list_view", {
    id_list: uuid("id_list").primaryKey(),
    id_user: uuid("id_user").notNull(),
    id_library: uuid("id_library").notNull(),
    list_name: varchar("list_name", { length: 100 }).notNull(),
    description: text("description"),
    is_public: boolean("is_public").notNull(),
    created_at: timestamp("created_at").notNull(),
    updated_at: timestamp("updated_at").notNull(),
    deleted_at: timestamp("deleted_at"),
    owner_username: varchar("owner_username", { length: 50 }).notNull(),
    owner_firstname: varchar("owner_firstname", { length: 50 }).notNull(),
    owner_lastname: varchar("owner_lastname", { length: 50 }).notNull(),
    user_deleted_at: timestamp("user_deleted_at"),
    library_name: varchar("library_name", { length: 100 }),
    library_deleted_at: timestamp("library_deleted_at")
});

// Vue 7: BookLibrary avec jointures optimisées
export const BookLibraryView = pgTable("book_library_view", {
    // BookLibrary fields
    id_book_library: uuid("id_book_library").primaryKey(),
    id_book: uuid("id_book").notNull(),
    id_library: uuid("id_library").notNull(),
    book_added_at: timestamp("book_added_at").notNull(),

    // Book fields (tous les champs nécessaires)
    isbn: varchar("isbn", { length: 17 }),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary"),
    nb_pages: integer("nb_pages"),
    publication_year: integer("publication_year"),
    language: varchar("language", { length: 5 }).notNull(),
    image: varchar("image", { length: 500 }),
    book_metadata: jsonb("book_metadata"),
    book_created_at: timestamp("book_created_at").notNull(),

    // Library fields (pour les contrôles d'accès)
    library_owner_id: uuid("library_owner_id").notNull(),
    lib_name: varchar("lib_name", { length: 100 }).notNull(),
    library_description: text("library_description"),
    library_is_public: boolean("library_is_public").notNull(),
    library_created_at: timestamp("library_created_at").notNull(),
    library_updated_at: timestamp("library_updated_at").notNull(),
    library_deleted_at: timestamp("library_deleted_at")
});

// Vue 7: LibraryBooks spécialisée pour getLibraryBooks
export const LibraryBooksView = pgTable("library_books_view", {
    id_book_library: uuid("id_book_library").notNull(),
    id_library: uuid("id_library").notNull(),
    book_added_at: timestamp("book_added_at").notNull(),
    // Champs Book pour l'API
    id_book: uuid("id_book").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    isbn: varchar("isbn", { length: 17 }),
    summary: text("summary"),
    nb_pages: integer("nb_pages"),
    publication_year: integer("publication_year"),
    language: varchar("language", { length: 5 }).notNull(),
    image: varchar("image", { length: 500 })
});

// Vue 8: ReviewView avec jointures User et Book
export const ReviewView = pgTable("review_view", {
    // Review fields
    id_review: uuid("id_review").primaryKey(),
    id_book: uuid("id_book").notNull(),
    id_user: uuid("id_user").notNull(),
    title: varchar("title", { length: 50 }).notNull(),
    comment: text("comment"),
    is_public: boolean("is_public").notNull(),
    is_spoiler: boolean("is_spoiler").notNull(),
    created_at: timestamp("created_at").notNull(),
    updated_at: timestamp("updated_at").notNull(),

    // User fields
    user_username: varchar("user_username", { length: 50 }).notNull(),
    user_firstname: varchar("user_firstname", { length: 50 }).notNull(),
    user_lastname: varchar("user_lastname", { length: 50 }).notNull(),
    user_deleted_at: timestamp("user_deleted_at"),

    // Book fields
    book_title: varchar("book_title", { length: 255 }).notNull(),
    book_image: varchar("book_image", { length: 500 }),
    book_author_name: jsonb("book_author_name")
});

// Types pour TypeScript
export type UserRoleViewSelect = typeof UserRoleView.$inferSelect;
export type RolePermissionViewSelect = typeof RolePermissionView.$inferSelect;
export type UserRolePermissionsViewSelect = typeof UserRolePermissionsView.$inferSelect;
export type AdminRolePermissionsViewSelect = typeof AdminRolePermissionsView.$inferSelect;
export type LibraryViewSelect = typeof LibraryView.$inferSelect;
export type ReadingListViewSelect = typeof ReadingListView.$inferSelect;
export type BookLibraryViewSelect = typeof BookLibraryView.$inferSelect;
export type LibraryBooksViewSelect = typeof LibraryBooksView.$inferSelect;
export type ReviewViewSelect = typeof ReviewView.$inferSelect;
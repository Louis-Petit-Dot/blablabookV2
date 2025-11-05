// =====================================================
// MODELS INDEX - Export centralisé des modèles
// =====================================================

// Modèles principaux
export { User, type UserSelect, type UserInsert } from "./user.ts";
export { Book, type BookSelect, type BookInsert } from "./book.ts";
export { Author, type AuthorSelect, type AuthorInsert } from "./author.ts";
export { Genre, type GenreSelect, type GenreInsert } from "./genre.ts";

// Modèles de contenu utilisateur
export { Review, type ReviewSelect, type ReviewInsert } from "./review.ts";
export { Rate, type RateSelect, type RateInsert } from "./rate.ts";
export { Library, type LibrarySelect, type LibraryInsert } from "./library.ts";
export { ReadingList, type ReadingListSelect, type ReadingListInsert } from "./reading-list.ts";

// Modèles RBAC
export { Role, type RoleSelect, type RoleInsert } from "./role.ts";
export { Permission, type PermissionSelect, type PermissionInsert } from "./permission.ts";
export { UserRole, type UserRoleSelect, type UserRoleInsert } from "./user-role.ts";
export { RolePermission, type RolePermissionSelect, type RolePermissionInsert } from "./role-permission.ts";

// Modèles de liaison (Many-to-Many)
export { BookAuthor, type BookAuthorSelect, type BookAuthorInsert } from "./book-author.ts";
export { BookGenre, type BookGenreSelect, type BookGenreInsert } from "./book-genre.ts";
export { BookLibrary, type BookLibrarySelect, type BookLibraryInsert } from "./book-library.ts";
export { BookReadingList, type BookReadingListSelect, type BookReadingListInsert } from "./book-reading-list.ts";

// Vues SQL
export { UserRoleView, RolePermissionView, UserRolePermissionsView, AdminRolePermissionsView, LibraryView, ReadingListView, BookLibraryView, LibraryBooksView, type UserRoleViewSelect, type RolePermissionViewSelect, type UserRolePermissionsViewSelect, type AdminRolePermissionsViewSelect, type LibraryViewSelect, type ReadingListViewSelect, type BookLibraryViewSelect, type LibraryBooksViewSelect } from "./views.ts";
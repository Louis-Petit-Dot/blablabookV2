// Export des models drizzle

// Models principaux
export * from "./user.ts";
export * from "./role.ts";
export * from "./permission.ts";
export * from "./book.ts";
export * from "./author.ts";
export * from "./genre.ts";
export * from "./library.ts";
export * from "./reading-list.ts";
export * from "./review.ts";
export * from "./rate.ts";

// Tables d'association
export * from "./user-role.ts";
export * from "./role-permission.ts";
export * from "./book-library.ts";
export * from "./book-reading-list.ts";
export * from "./book-author.ts";
export * from "./book-genre.ts";

// Import des tables pour drizzle
import { User } from "./user.ts";
import { Role } from "./role.ts";
import { Permission } from "./permission.ts";
import { Book } from "./book.ts";
import { Author } from "./author.ts";
import { Genre } from "./genre.ts";
import { Library } from "./library.ts";
import { ReadingList } from "./reading-list.ts";
import { Review } from "./review.ts";
import { Rate } from "./rate.ts";
import { UserRole } from "./user-role.ts";
import { RolePermission } from "./role-permission.ts";
import { BookLibrary } from "./book-library.ts";
import { BookReadingList } from "./book-reading-list.ts";
import { BookAuthor } from "./book-author.ts";
import { BookGenre } from "./book-genre.ts";

// Schema complet pour drizzle
export const schema = {
    // Tables principales
    User,
    Role,
    Permission,
    Book,
    Author,
    Genre,
    Library,
    ReadingList,
    Review,
    Rate,

    // Tables d'association
    UserRole,
    RolePermission,
    BookLibrary,
    BookReadingList,
    BookAuthor,
    BookGenre,
};
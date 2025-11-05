-- =====================================================
-- BlaBlaBook V2 
-- PostgreSQL 17
-- =====================================================

BEGIN;

-- Clean
DROP TABLE IF EXISTS "BOOK_GENRE" CASCADE;
DROP TABLE IF EXISTS "BOOK_AUTHOR" CASCADE;
DROP TABLE IF EXISTS "READING_LIST_BOOK" CASCADE;
DROP TABLE IF EXISTS "BOOK_LIBRARY" CASCADE;
DROP TABLE IF EXISTS "ROLE_PERMISSION" CASCADE;
DROP TABLE IF EXISTS "USER_ROLE" CASCADE;
DROP TABLE IF EXISTS "LIBRARY_PERMISSION" CASCADE;
DROP TABLE IF EXISTS "RATE" CASCADE;
DROP TABLE IF EXISTS "REVIEW" CASCADE;
DROP TABLE IF EXISTS "READING_LIST" CASCADE;
DROP TABLE IF EXISTS "LIBRARY" CASCADE;
DROP TABLE IF EXISTS "BOOK" CASCADE;
DROP TABLE IF EXISTS "AUTHOR" CASCADE;
DROP TABLE IF EXISTS "GENRE" CASCADE;
DROP TABLE IF EXISTS "PERMISSION" CASCADE;
DROP TABLE IF EXISTS "ROLE" CASCADE;
DROP TABLE IF EXISTS "USER" CASCADE;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE "USER" (
  id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  preferences JSONB DEFAULT '{}', -- preferecnces explicites utilisateur
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE "ROLE" (
  id_role UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "PERMISSION" (
  id_permission UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(50) UNIQUE NOT NULL,
  action VARCHAR(255),
  resource VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "BOOK" (
  id_book UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn VARCHAR(17) UNIQUE,
  openlibrary_key VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  nb_pages INTEGER CHECK (nb_pages > 0),
  publication_year INTEGER CHECK (publication_year > 0),
  language VARCHAR(5) NOT NULL DEFAULT 'fr',
  image VARCHAR(500),
  metadata JSONB DEFAULT '{}', -- metadata additionnelle (éditeur, format, dimensions, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "AUTHOR" (
  id_author UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name VARCHAR(200) NOT NULL,
  bio TEXT,  
  wikipedia_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "GENRE" (
  id_genre UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genre_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "LIBRARY" (
  id_library UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  lib_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE "READING_LIST" (
  id_list UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  id_library UUID NOT NULL,
  list_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE (id_user, id_library, list_name)
);

CREATE TABLE "REVIEW" (
  id_review UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE RESTRICT,
  title VARCHAR(50) NOT NULL,
  comment TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  UNIQUE (id_user, id_book)
);

CREATE TABLE "RATE" (
  id_rate UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE RESTRICT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (id_user, id_book)
);


-- =====================================================
-- ASSOCIATION TABLES
-- =====================================================

CREATE TABLE "USER_ROLE" (
  id_user_role UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  id_role UUID NOT NULL REFERENCES "ROLE"(id_role) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES "USER"(id_user) ON DELETE SET NULL

);

CREATE TABLE "ROLE_PERMISSION" (
  id_role_permission UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_role UUID NOT NULL REFERENCES "ROLE"(id_role) ON DELETE CASCADE,
  id_permission UUID NOT NULL REFERENCES "PERMISSION"(id_permission) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()

);

CREATE TABLE "BOOK_LIBRARY" (
  id_book_library UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
  id_library UUID NOT NULL REFERENCES "LIBRARY"(id_library) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()

);

CREATE TABLE "READING_LIST_BOOK" (
  id_reading_list_book UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_list UUID NOT NULL REFERENCES "READING_LIST"(id_list) ON DELETE CASCADE,
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW() 

);

CREATE TABLE "BOOK_AUTHOR" (
  id_book_author UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
  id_author UUID NOT NULL REFERENCES "AUTHOR"(id_author) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "BOOK_GENRE" (
  id_book_genre UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
  id_genre UUID NOT NULL REFERENCES "GENRE"(id_genre) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()

);

-- =====================================================
-- VIEWS
-- =====================================================

-- VIEW 1 getUserRoles et getRolesUsers
CREATE VIEW user_role_view AS
SELECT
  u.id_user,
  u.username,
  u.firstname,
  u.lastname,
  u.email,
  r.id_role,  
  r.role_name,
  r.description AS role_description,
  ur.assigned_at,
  ur.assigned_by,
  assigner.username AS assigner_username,
  assigner.firstname AS assigner_firstname,
  assigner.lastname AS assigner_lastname
FROM "USER_ROLE" ur
INNER JOIN "USER" u ON ur.id_user = u.id_user
INNER JOIN "ROLE" r ON ur.id_role = r.id_role
LEFT JOIN "USER" assigner ON ur.assigned_by = assigner.id_user
WHERE u.deleted_at IS NULL;

-- VIEW 2 getRolePermissions
CREATE VIEW role_permission_view AS
SELECT
  u.id_user,
  u.username,
  u.firstname,
  u.lastname,
  r.id_role,
  r.role_name,
  ur.assigned_at,
  p.id_permission,
  p.label,
  p.action,
  p.resource
FROM "USER_ROLE" ur
INNER JOIN "USER" u ON ur.id_user = u.id_user
INNER JOIN "ROLE" r ON ur.id_role = r.id_role
INNER JOIN "ROLE_PERMISSION" rp ON r.id_role = rp.id_role
INNER JOIN "PERMISSION" p ON rp.id_permission = p.id_permission
WHERE u.deleted_at IS NULL;

-- VIEW 3 permissions du user
CREATE VIEW user_role_permissions_view AS
  SELECT
      p.id_permission,
      p.label,
      p.action,
      p.resource
  FROM "ROLE" r
  INNER JOIN "ROLE_PERMISSION" rp ON r.id_role = rp.id_role
  INNER JOIN "PERMISSION" p ON rp.id_permission = p.id_permission
  WHERE r.role_name = 'USER';

-- VIEW 4 permissions de l'admin
CREATE VIEW admin_role_permissions_view AS
  SELECT
      p.id_permission,
      p.label,
      p.action,
      p.resource
  FROM "ROLE" r
  INNER JOIN "ROLE_PERMISSION" rp ON r.id_role = rp.id_role
  INNER JOIN "PERMISSION" p ON rp.id_permission = p.id_permission
  WHERE r.role_name = 'ADMIN';

-- VIEW 5 library_view
CREATE VIEW library_view AS
SELECT
    l.id_library,
    l.id_user,
    l.lib_name,
    l.description,
    l.is_public,
    l.created_at,
    l.updated_at,
    l.deleted_at,
    u.username as owner_username,
    u.firstname as owner_firstname,
    u.lastname as owner_lastname,
    u.deleted_at as user_deleted_at
FROM "LIBRARY" l
INNER JOIN "USER" u ON l.id_user = u.id_user;

-- VIEW 6 reading_list_view
CREATE VIEW reading_list_view AS
SELECT
    rl.id_list,
    rl.id_user,
    rl.id_library,
    rl.list_name,
    rl.description,
    rl.is_public,
    rl.created_at,
    rl.updated_at,
    rl.deleted_at,
    u.username as owner_username,
    u.firstname as owner_firstname,
    u.lastname as owner_lastname,
    u.deleted_at as user_deleted_at,
    l.lib_name as library_name,
    l.deleted_at as library_deleted_at
FROM "READING_LIST" rl
INNER JOIN "USER" u ON rl.id_user = u.id_user
INNER JOIN "LIBRARY" l ON rl.id_library = l.id_library;

-- VIEW 7 book_library_view avec jointures optimisees (complete)
CREATE VIEW book_library_view AS
SELECT
    -- BookLibrary fields
    bl.id_book_library,
    bl.id_book,
    bl.id_library,
    bl.created_at as book_added_at,

    -- Book fields (tous les champs necessaires)
    b.isbn,
    b.title,
    b.summary,
    b.nb_pages,
    b.publication_year,
    b.language,
    b.image,
    b.metadata as book_metadata,
    b.created_at as book_created_at,

    -- Library fields (pour les controles d'acces)
    l.id_user as library_owner_id,
    l.lib_name,
    l.description as library_description,
    l.is_public as library_is_public,
    l.created_at as library_created_at,
    l.updated_at as library_updated_at,
    l.deleted_at as library_deleted_at

FROM "BOOK_LIBRARY" bl
INNER JOIN "BOOK" b ON bl.id_book = b.id_book
INNER JOIN "LIBRARY" l ON bl.id_library = l.id_library
WHERE l.deleted_at IS NULL;

-- VIEW 8 library_books_view (juste les champs Book necessaires)
CREATE VIEW library_books_view AS
SELECT
    bl.id_book_library,
    bl.id_library,
    bl.created_at as book_added_at,

    -- Champs Book pour l'API
    b.id_book,
    b.title,
    b.isbn,
    b.summary,
    b.nb_pages,
    b.publication_year,
    b.language,
    b.image
FROM "BOOK_LIBRARY" bl
INNER JOIN "BOOK" b ON bl.id_book = b.id_book
INNER JOIN "LIBRARY" l ON bl.id_library = l.id_library
WHERE l.deleted_at IS NULL;

-- VIEW 9 vue pour les reviews avec infos user et book
CREATE VIEW review_view AS
SELECT
    -- Champs Review
    r.id_review,
    r.id_book,
    r.id_user,
    r.title,
    r.comment,
    r.is_public,
    r.is_spoiler,
    r.created_at,
    r.updated_at,

    -- Champs User
    u.username AS user_username,
    u.firstname AS user_firstname,
    u.lastname AS user_lastname,
    u.deleted_at AS user_deleted_at,

    -- Champs Book
  b.title AS book_title,
  b.image AS book_image,
  a.author_name AS book_author_name
FROM "REVIEW" r
  INNER JOIN "USER" u ON r.id_user = u.id_user
  INNER JOIN "BOOK" b ON r.id_book = b.id_book
  LEFT JOIN "BOOK_AUTHOR" ba ON b.id_book = ba.id_book
  LEFT JOIN "AUTHOR" a ON ba.id_author = a.id_author;

-- =====================================================
-- INDEXES (basés sur les requêtes réelles du code)
-- =====================================================

-- USER (auth + RBAC critiques)
CREATE INDEX idx_user_email ON "USER"(email);
CREATE INDEX idx_user_deleted ON "USER"(deleted_at) WHERE deleted_at IS NULL;

-- ROLE (RBAC - recherche par nom très fréquente)
CREATE INDEX idx_role_name ON "ROLE"(role_name);

-- USER_ROLE (RBAC - jointures très fréquentes)
CREATE INDEX idx_user_role_user ON "USER_ROLE"(id_user);
CREATE INDEX idx_user_role_role ON "USER_ROLE"(id_role);

-- ROLE_PERMISSION (RBAC - jointures fréquentes)
CREATE INDEX idx_role_permission_role ON "ROLE_PERMISSION"(id_role);

-- LIBRARY (getById, updates)
CREATE INDEX idx_library_user ON "LIBRARY"(id_user);
CREATE INDEX idx_library_deleted ON "LIBRARY"(deleted_at) WHERE deleted_at IS NULL;

-- READING_LIST (getById, updates)
CREATE INDEX idx_reading_list_user ON "READING_LIST"(id_user);
CREATE INDEX idx_reading_list_deleted ON "READING_LIST"(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- BASIC DATA
-- =====================================================

INSERT INTO "ROLE" (role_name, description) VALUES
('USER', 'Standard user'),
-- V2:('MODERATOR', 'Content moderator')
('ADMIN', 'System administrator');

INSERT INTO "PERMISSION" (label, action, resource) VALUES
('READ_BOOK', 'View books', 'books'),
('CREATE_REVIEW', 'Write reviews', 'reviews'),
('RATE_BOOK', 'Rate books', 'ratings'),
('DELETE_RATING', 'Delete ratings', 'ratings'),
('MANAGE_LIBRARY', 'Manage libraries', 'libraries'),
('MANAGE_READING_LISTS', 'Manage reading lists', 'reading_lists'),
('CREATE_AUTHOR', 'Create authors', 'authors'),
('CREATE_GENRE', 'Create genres', 'genres'),
('MODERATE_CONTENT', 'Moderate content', 'system'),
('ADMIN_ACCESS', 'Full access', 'system');

INSERT INTO "ROLE_PERMISSION" (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM "ROLE" r, "PERMISSION" p
WHERE
  (r.role_name = 'USER' AND p.label IN ('READ_BOOK',
  'CREATE_REVIEW', 'RATE_BOOK', 'DELETE_RATING',
  'MANAGE_LIBRARY', 'MANAGE_READING_LISTS'))
  OR
  (r.role_name = 'ADMIN' AND p.label IN ('READ_BOOK',
  'CREATE_REVIEW', 'RATE_BOOK', 'DELETE_RATING',
  'MANAGE_LIBRARY', 'MANAGE_READING_LISTS', 'CREATE_AUTHOR', 'CREATE_GENRE', 'MODERATE_CONTENT', 'ADMIN_ACCESS'));

-- Seed users: 10 regular users + 10 admin users
-- Password pour tous: Password123! (hashé avec Argon2)
INSERT INTO "USER" (firstname, lastname, username, email, password) VALUES
-- Regular users
('Harry', 'Cauvert', 'user1', 'user1@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user2', 'user2@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user3', 'user3@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user4', 'user4@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user5', 'user5@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user6', 'user6@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user7', 'user7@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user8', 'user8@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user9', 'user9@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Harry', 'Cauvert', 'user10', 'user10@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
-- Admin users
('Laurene', 'Kish', 'admin1', 'admin1@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin2', 'admin2@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin3', 'admin3@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin4', 'admin4@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin5', 'admin5@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin6', 'admin6@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin7', 'admin7@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin8', 'admin8@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin9', 'admin9@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w'),
('Laurene', 'Kish', 'admin10', 'admin10@test.com', '$argon2id$v=19$m=65536,t=3,p=4$3pBuCPzdwpNq8CL4hZfoeA$oEMrr7tpYelQ7FgTGw1pS4yk8sGedZSLK9b4yvLc71w');

-- Assign USER role to all users (default behavior)
INSERT INTO "USER_ROLE" (id_user, id_role, assigned_by)
SELECT u.id_user, r.id_role, u.id_user
FROM "USER" u, "ROLE" r
WHERE r.role_name = 'USER';

-- Assign ADMIN role to admin users
INSERT INTO "USER_ROLE" (id_user, id_role, assigned_by)
SELECT u.id_user, r.id_role, u.id_user
FROM "USER" u, "ROLE" r
WHERE r.role_name = 'ADMIN'
AND u.username LIKE 'admin%';

INSERT INTO "GENRE" (genre_name, description) VALUES
('Young Adult', 'Literature for young adults'),
('Horror', 'Horror and supernatural'),
('Comedy', 'Humorous works'),
('Drama', 'Dramatic literature'),
('Adventure', 'Adventure stories'),
('Poetry', 'Poetry collections'),
('Essay', 'Essays and reflections'),
('Historical', 'Historical fiction'),
('Crime', 'Crime and detective fiction'),
('Thriller', 'Suspense and thriller novels'),
('Policier', 'Police procedural and detective stories'),
('Science-Fiction', 'Science fiction and futuristic stories'),
('Fantasy', 'Fantasy and magical stories'),
('Romance', 'Romantic fiction'),
('Biographie', 'Biographical works'),
('Développement personnel', 'Self-help and personal development'),
('Philosophie', 'Philosophical works'),
('Religion', 'Religious and spiritual texts'),
('Art', 'Art and creative works'),
('Cuisine', 'Cooking and culinary arts'),
('Voyage', 'Travel and exploration'),
('Santé', 'Health and wellness'),
('Business', 'Business and economics'),
('Sciences', 'Scientific and technical works'),
('Divers', 'Miscellaneous and unclassified works');

COMMIT;

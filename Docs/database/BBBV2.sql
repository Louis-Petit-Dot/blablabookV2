-- =====================================================
-- BlaBlaBook V2 
-- PostgreSQL 17
-- =====================================================

BEGIN;

-- Clean slate
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
-- CORE TABLES
-- =====================================================

CREATE TABLE "USER" (
  id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  preferences JSONB DEFAULT '{}', -- preferecnces explicites utilisateur
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE "ROLE" (
  id_role SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "PERMISSION" (
  id_permission SERIAL PRIMARY KEY,
  label VARCHAR(100) UNIQUE NOT NULL,
  action VARCHAR(255),
  resource VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "BOOK" (
  id_book UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn VARCHAR(17) UNIQUE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  nb_pages INTEGER CHECK (nb_pages > 0),
  publication_year INTEGER CHECK (publication_year > 0),
  language VARCHAR(5) NOT NULL DEFAULT 'fr',
  image VARCHAR(500),
  metadata JSONB DEFAULT '{}', -- metadata additionnelle (éditeur, format, dimensions, etc.)
  is_temporary BOOLEAN NOT NULL DEFAULT FALSE,
  imported_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "AUTHOR" (
  id_author UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstname VARCHAR(100),
  lastname VARCHAR(100) NOT NULL,
  bio TEXT,
  birth_date DATE,
  death_date DATE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CHECK (death_date IS NULL OR birth_date IS NULL OR death_date >= birth_date)
);

CREATE TABLE "GENRE" (
  id_genre SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "LIBRARY" (
  id_library UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE "READING_LIST" (
  id_list UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  id_library UUID REFERENCES "LIBRARY"(id_library) ON DELETE SET NULL,
  list_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (id_user, list_name)
);

CREATE TABLE "REVIEW" (
  id_review UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE RESTRICT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  contains_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (id_user, id_book)
);

CREATE TABLE "RATE" (
  id_rate UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE RESTRICT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (id_user, id_book)
);

CREATE TABLE "LIBRARY_PERMISSION" (
  id_permission UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_library UUID NOT NULL REFERENCES "LIBRARY"(id_library) ON DELETE CASCADE,
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  permission_level VARCHAR(10) NOT NULL, -- 'read', 'write', 'admin'
  granted_by UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE RESTRICT,
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,

  CHECK (id_user != granted_by),
  CHECK (expires_at IS NULL OR expires_at > granted_at)
);

-- =====================================================
-- ASSOCIATION TABLES
-- =====================================================

CREATE TABLE "USER_ROLE" (
  id_user UUID NOT NULL REFERENCES "USER"(id_user) ON DELETE CASCADE,
  id_role SERIAL NOT NULL REFERENCES "ROLE"(id_role) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES "USER"(id_user) ON DELETE SET NULL,

  PRIMARY KEY (id_user, id_role)
);

CREATE TABLE "ROLE_PERMISSION" (
  id_role SERIAL NOT NULL REFERENCES "ROLE"(id_role) ON DELETE CASCADE,
  id_permission SERIAL NOT NULL REFERENCES "PERMISSION"(id_permission) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id_role, id_permission)
);

CREATE TABLE "BOOK_LIBRARY" (
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
  id_library UUID NOT NULL REFERENCES "LIBRARY"(id_library) ON DELETE CASCADE,
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT,

  PRIMARY KEY (id_book, id_library)
);

CREATE TABLE "READING_LIST_BOOK" (
  id_list UUID NOT NULL REFERENCES "READING_LIST"(id_list) ON DELETE CASCADE,
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
  reading_status VARCHAR(20) NOT NULL DEFAULT 'to_read', -- 'to_read', 'reading', 'read', 'abandoned', 'on_hold'
  priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
  personal_notes TEXT,
  date_added TIMESTAMP NOT NULL DEFAULT NOW(),
  date_started TIMESTAMP,
  date_finished TIMESTAMP,

  CHECK (date_finished IS NULL OR date_started IS NULL OR date_finished >= date_started),

  PRIMARY KEY (id_list, id_book)
);

CREATE TABLE "BOOK_AUTHOR" (
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
  id_author UUID NOT NULL REFERENCES "AUTHOR"(id_author) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'author', -- 'author', 'co-author', 'editor', 'translator'
  order_index INTEGER NOT NULL DEFAULT 1,

  PRIMARY KEY (id_book, id_author)
);

CREATE TABLE "BOOK_GENRE" (
  id_book UUID NOT NULL REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
  id_genre SERIAL NOT NULL REFERENCES "GENRE"(id_genre) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id_book, id_genre)
);

-- =====================================================
-- BASIC DATA
-- =====================================================

INSERT INTO "ROLE" (name, description) VALUES
('USER', 'Standard user'),
('MODERATOR', 'Content moderator'),
('ADMIN', 'System administrator');

INSERT INTO "PERMISSION" (label, action, resource) VALUES
('READ_BOOK', 'View books', 'books'),
('CREATE_REVIEW', 'Write reviews', 'reviews'),
('MANAGE_LIBRARY', 'Manage libraries', 'libraries'),
('MODERATE_CONTENT', 'Moderate content', 'system'),
('ADMIN_ACCESS', 'Full access', 'system');

INSERT INTO "ROLE_PERMISSION" (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM "ROLE" r, "PERMISSION" p
WHERE
  (r.name = 'USER' AND p.label IN ('READ_BOOK', 'CREATE_REVIEW', 'MANAGE_LIBRARY'))
  OR
  (r.name = 'MODERATOR' AND p.label IN ('READ_BOOK', 'CREATE_REVIEW', 'MANAGE_LIBRARY', 'MODERATE_CONTENT'))
  OR
  (r.name = 'ADMIN' AND p.label = 'ADMIN_ACCESS');

INSERT INTO "GENRE" (name, description) VALUES
('Fiction', 'Literary fiction'),
('Science Fiction', 'Sci-fi and futuristic'),
('Fantasy', 'Fantasy and magic'),
('Mystery', 'Mystery and detective'),
('Romance', 'Romantic fiction'),
('Thriller', 'Suspense and thriller'),
('Non-Fiction', 'Factual works'),
('Biography', 'Life stories'),
('History', 'Historical works'),
('Science', 'Scientific works');

COMMIT;

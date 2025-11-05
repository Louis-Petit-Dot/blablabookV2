# Changements API - Controllers vs Documentation

Date: 2025-10-16

## Vue d'ensemble

Ce document liste toutes les différences entre l'implémentation actuelle des controllers (dans `backend/src/controllers/`) et la documentation API originale (`Docs/cdc/api-specifications.adoc`).

## Nouveaux Controllers Implémentés (Non Documentés)

Les controllers suivants ont été implémentés mais n'étaient pas dans la documentation originale :

### 1. `authorController.ts`
**Routes :**
- `GET /api/authors` - Liste tous les auteurs
- `GET /api/authors/:id` - Détails d'un auteur
- `GET /api/authors/:name/works` - Œuvres d'un auteur
- `POST /api/authors` - Créer un auteur
- `DELETE /api/authors/:id` - Supprimer un auteur

**Validation :**
- `author_name` requis
- Validation URL Wikipedia

### 2. `genreController.ts`
**Routes :**
- `GET /api/genres` - Liste tous les genres
- `GET /api/genres/:id` - Détails d'un genre
- `GET /api/genres/:name/books` - Livres d'un genre
- `POST /api/genres` - Créer un genre

### 3. `rateController.ts`
**Routes :**
- `GET /api/books/:id/rates` - Notations d'un livre
- `POST /api/rates` - Créer/Modifier une notation
- `DELETE /api/rates/:id` - Supprimer sa notation

**Fonctionnalités :**
- Système de notation 1-5 étoiles (séparé des reviews)
- Upsert automatique (update si existe, create sinon)
- Calcul de moyenne et total

### 4. `roleController.ts`
**Routes :**
- `GET /api/roles` - Liste tous les rôles
- `GET /api/roles/:id` - Détails d'un rôle
- `GET /api/roles/system` - Rôles système (USER/ADMIN)
- `GET /api/roles/:role/permissions` - Permissions d'un rôle
- `POST /api/roles` - Créer un rôle
- `POST /api/roles/:id/permissions` - Ajouter permission
- `PUT /api/roles/:id` - Modifier un rôle
- `DELETE /api/roles/:id` - Supprimer un rôle
- `DELETE /api/roles/:id/permissions/:permissionId` - Retirer permission

**Système RBAC complet implémenté**

### 5. `permissionController.ts`
Gestion des permissions pour le système RBAC.

### 6. Controllers d'Association
- `authorBookController.ts` - Many-to-many auteurs ↔ livres
- `bookGenreController.ts` - Many-to-many livres ↔ genres
- `bookLibraryController.ts` - Many-to-many livres ↔ bibliothèques
- `bookReadingListController.ts` - Many-to-many livres ↔ listes
- `userRoleController.ts` - Many-to-many utilisateurs ↔ rôles

## Modifications des Controllers Existants

### `bookController.ts`

**Nouvelles routes non documentées :**
- `GET /api/books` - Liste tous les livres (limit: 50 par défaut)
- `GET /api/books/trending` - Livres tendances (remplace `/random`)
- `GET /api/books/:userId/books` - Tous les livres d'un utilisateur
- `POST /api/books` - Créer un livre depuis Open Library
- `DELETE /api/books/:id` - Supprimer un livre

**Route supprimée :**
- ❌ `GET /api/books/random` → Remplacé par `/api/books/trending`

**Fonctionnalités :**
- Déduplication des livres par utilisateur
- Création depuis données Open Library avec détection de doublons
- Suppression en cascade via contraintes SQL

### `userController.ts`

**Routes implémentées :**
- `GET /api/users` - Liste tous les utilisateurs
- `GET /api/users/:id` - Récupérer un utilisateur
- `POST /api/users` (via `create()`) - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `PUT /api/users/:id` - Modifier un utilisateur
- `PUT /api/users/:id/password` - **NOUVEAU** Modifier mot de passe
- `DELETE /api/users/:id` - Supprimer un utilisateur

**Routes documentées NON implémentées :**
- ❌ `GET /api/user/export` - Export données RGPD
- ❌ `DELETE /api/user/account` - Suppression compte RGPD
- ❌ `POST /api/auth/refresh` - Refresh token

**Changements majeurs :**
- JWT stocké dans cookies httpOnly (sécurité XSS)
- Système de lockout après échecs de connexion
- Validation Zod via middlewares
- Token renvoyé dans JSON ET cookie pour compatibilité

### `libraryController.ts`

**Routes implémentées :**
- `GET /api/libraries?user_id=X` - Bibliothèques d'un utilisateur
- `GET /api/libraries/:id` - Détails d'une bibliothèque
- `POST /api/libraries` - Créer une bibliothèque
- `PUT /api/libraries/:id` - Modifier une bibliothèque
- `PUT /api/libraries/:id/visibility` - **NOUVEAU** Toggle visibilité
- `DELETE /api/libraries/:id` - Supprimer une bibliothèque

**Différences avec documentation :**
- Routes plus génériques que `/api/library`
- Toggle visibilité publique/privée ajouté
- Requiert `user_id` en query param pour GET

### `readingListController.ts`

**Routes implémentées :**
- `GET /api/reading-lists/accessible` - **NOUVEAU** Listes accessibles
- `GET /api/reading-lists/users/:id` - **NOUVEAU** Listes d'un user
- `GET /api/reading-lists/:id` - Détails d'une liste
- `POST /api/reading-lists` - Créer une liste
- `PUT /api/reading-lists/:id` - Modifier une liste
- `DELETE /api/reading-lists/:id` - Supprimer une liste

**Routes documentées NON implémentées :**
- ❌ `POST /api/reading-lists/:id/books` - Ajouter livre
- ❌ `DELETE /api/reading-lists/:id/books/:bookId` - Retirer livre

**Fonctionnalités :**
- Gestion visibilité publique/privée
- Contrôle d'accès basé sur ownership

### `reviewController.ts`

**Routes implémentées :**
- `GET /api/reviews` - **NOUVEAU** Tous les avis
- `GET /api/users/:userId/reviews` - **NOUVEAU** Avis d'un user
- `GET /api/books/:id/reviews` - Avis d'un livre
- `POST /api/reviews` - Créer un avis
- `PUT /api/reviews/:id` - Modifier son avis
- `DELETE /api/reviews/:id` - Supprimer son avis

**Champs reviews :**
- `id_book`, `id_user`, `title` (requis)
- `comment`, `is_public`, `is_spoiler` (optionnels)

**Note :** Les ratings sont maintenant séparés dans `rateController`

### `adminController.ts`

**Routes implémentées :**
- `GET /api/admin/users` - Liste utilisateurs avec rôles
- `GET /api/admin/reviews` - **NOUVEAU** Tous les avis
- `DELETE /api/admin/reviews/:id` - Supprimer un avis

**Routes documentées NON implémentées :**
- ❌ `PUT /api/admin/users/:id/suspend` - Suspendre utilisateur
- ❌ `GET /api/admin/stats` - Statistiques globales

**Fonctionnalités :**
- Récupération utilisateurs avec leurs rôles (JOIN)
- Récupération reviews avec infos user et book
- Admin bypass pour suppression reviews

## Sécurité & Middlewares

### Authentification
- **JWT dans cookies httpOnly** (protection XSS)
- Token aussi renvoyé en JSON pour compatibilité
- Middleware `auth.ts` pour validation

### Lockout système
- 5 tentatives échouées → verrouillage 15 minutes
- Implémenté dans `authLockout.ts`
- Message d'erreur avec temps restant

### Validation
- Validation Zod via middlewares
- Données validées accessibles via `c.get('validatedData')`

### Soft Delete
- Champ `deleted_at` sur les utilisateurs
- Filtrage automatique avec `isNull(User.deleted_at)`

## Recommandations

### À implémenter (Routes manquantes de la doc)
1. **RGPD** :
   - `GET /api/user/export` - Export données utilisateur
   - `DELETE /api/user/account` - Suppression compte avec justification

2. **Admin** :
   - `PUT /api/admin/users/:id/suspend` - Suspension temporaire
   - `GET /api/admin/stats` - Dashboard statistiques

3. **Reading Lists** :
   - `POST /api/reading-lists/:id/books` - Ajouter livre
   - `DELETE /api/reading-lists/:id/books/:bookId` - Retirer livre

4. **Refresh Token** :
   - `POST /api/auth/refresh` - Renouveler access token

### À documenter (Routes implémentées mais non doc)
- Tous les nouveaux controllers (authors, genres, rates, roles)
- Nouvelles routes books (trending, getUserBooks, create, delete)
- Nouvelles routes users (updatePassword)
- Nouvelles routes libraries (toggleVisibility)
- Nouvelles routes reading-lists (getAccessibleLists, getUserLists)
- Nouvelles routes reviews (getAllReviews, getUserReviews)
- Nouvelles routes admin (getAllReviews)

## Fichiers Générés

1. **`api-specifications-updated.adoc`** - Documentation API complète mise à jour
2. **Ce fichier** - Synthèse des changements

## Actions Suivantes

1. ✅ Comparer controllers avec documentation
2. ✅ Créer documentation mise à jour
3. ⏳ Valider avec l'équipe
4. ⏳ Décider : remplacer `api-specifications.adoc` ou garder les deux ?
5. ⏳ Implémenter routes manquantes prioritaires (RGPD, reading-lists books)
6. ⏳ Mettre à jour tests selon nouvelle documentation

---

**Note :** Cette analyse a été générée automatiquement en comparant les controllers dans `backend/src/controllers/` avec `Docs/cdc/api-specifications.adoc`.

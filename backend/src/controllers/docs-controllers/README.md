# Documentation Controllers Backend

Ce dossier contient la documentation technique des controllers de l'API BlaBlaBook V2.

## Structure

Chaque controller est documenté avec :
- Les routes exposées
- Les paramètres attendus
- Les réponses retournées
- Les validations appliquées
- Les permissions requises

## Liste des Controllers

### Controllers Principaux
- [bookController](./bookController.md) - Gestion des livres
- [userController](./userController.md) - Gestion des utilisateurs et authentification
- [libraryController](./libraryController.md) - Gestion des bibliothèques personnelles
- [readingListController](./readingListController.md) - Gestion des listes de lecture
- [reviewController](./reviewController.md) - Gestion des avis
- [rateController](./rateController.md) - Système de notation
- [authorController](./authorController.md) - Gestion des auteurs
- [genreController](./genreController.md) - Gestion des genres
- [roleController](./roleController.md) - Gestion des rôles (RBAC)
- [permissionController](./permissionController.md) - Gestion des permissions
- [adminController](./adminController.md) - Routes d'administration

### Controllers d'Association (Many-to-Many)
- [authorBookController](./authorBookController.md)
- [bookGenreController](./bookGenreController.md)
- [bookLibraryController](./bookLibraryController.md)
- [bookReadingListController](./bookReadingListController.md)
- [userRoleController](./userRoleController.md)

## Changements vs Documentation CDC

Voir [CONTROLLERS-API-CHANGES.md](./CONTROLLERS-API-CHANGES.md) pour une analyse détaillée des différences entre l'implémentation actuelle et la documentation CDC originale.

## Conventions

### Format des routes
```
METHOD /api/resource/:param
```

### Codes de réponse
- `200 OK` - Succès
- `201 Created` - Création réussie
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Non authentifié
- `403 Forbidden` - Non autorisé
- `404 Not Found` - Ressource introuvable
- `500 Internal Server Error` - Erreur serveur

### Authentification
Les routes protégées nécessitent un header :
```
Authorization: Bearer <token>
```

Le token est également stocké dans un cookie httpOnly `authToken`.

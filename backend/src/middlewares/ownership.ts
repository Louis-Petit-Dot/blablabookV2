import type { Context, Next } from "hono";
import { readingListService } from "../services/readingListService.ts";
import db from "../config/database.ts";
import { Review, Rate } from "../models/index.ts";
import { eq } from "drizzle-orm";

export function requireOwnership(paramName = 'id') {
  return async function ownershipMiddleware(c: Context, next: Next) {
    const currentUser = c.get('user');
    const resourceUserId = c.req.param(paramName);

    if (!currentUser || !currentUser.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (currentUser.id !== resourceUserId) {
      return c.json({ error: 'Access denied.' }, 403);
    }

    await next();
  };
}

export function requireOwnershipOrAdmin(paramName = 'id') {
  return async function ownershipOrAdminMiddleware(c: Context, next: Next) {
    const currentUser = c.get('user');
    const resourceUserId = c.req.param(paramName);

    if (!currentUser || !currentUser.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Si c'est le proprietaire, on autorise
    if (currentUser.id === resourceUserId) {
      await next();
      return;
    }

    // Sinon, on verifie si c'est un admin (sera gere par le middleware RBAC suivant)
    await next();
  };
}

// =====================================================
// OWNERSHIP SPECIALISE POUR RESSOURCES
// =====================================================

export function requireListOwnership() {
  return async function listOwnershipMiddleware(c: Context, next: Next) {
    const currentUser = c.get('user');
    const listId = c.req.param('id');

    if (!currentUser || !currentUser.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    try {
      const list = await readingListService.getListById(listId, currentUser.id);

      if (!list) {
        return c.json({ error: 'Reading list not found or access denied.' }, 404);
      }

      await next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error checking list ownership';
      const status = message.includes('Access denied') ? 403 : 500;
      return c.json({ error: message }, status);
    }
  };
}

export function requireReviewOwnership() {
  return async function reviewOwnershipMiddleware(c: Context, next: Next) {
    const currentUser = c.get('user');
    const reviewId = c.req.param('id');

    if (!currentUser || !currentUser.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    try {
      // Verifie ownership de la review
      const review = await db()
        .select()
        .from(Review)
        .where(eq(Review.id_review, reviewId))
        .limit(1);

      if (review.length === 0) {
        return c.json({ error: 'Review not found' }, 404);
      }

      // allow owner
      if (review[0].id_user === currentUser.id) {
        await next();
        return;
      }

      // allow admin users (adapter selon la shape du user dans le JWT)
      if (currentUser.role === 'admin' || currentUser.is_admin === true) {
        await next();
        return;
      }

      return c.json({ error: 'Access denied - Not your review' }, 403);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error checking review ownership';
      return c.json({ error: message }, 500);
    }
  };
}

export function requireRateOwnership() {
  return async function rateOwnershipMiddleware(c: Context, next: Next) {
    const currentUser = c.get('user');
    const rateId = c.req.param('id');

    if (!currentUser || !currentUser.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    try {
      // Verifie ownership du rating
      const rate = await db()
        .select()
        .from(Rate)
        .where(eq(Rate.id_rate, rateId))
        .limit(1);

      if (rate.length === 0) {
        return c.json({ error: 'Rating not found' }, 404);
      }

      if (rate[0].id_user !== currentUser.id) {
        return c.json({ error: 'Access denied - Not your rating' }, 403);
      }

      await next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error checking rating ownership';
      return c.json({ error: message }, 500);
    }
  };
}

export function requireLibraryOwnership(paramName = 'id') {
  return async function libraryOwnershipMiddleware(c: Context, next: Next) {
    const currentUser = c.get('user');
    const libraryId = c.req.param(paramName);

    if (!currentUser || !currentUser.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    try {
      const { libraryService } = await import("../services/libraryService.ts");
      const library = await libraryService.getById(libraryId);

      if (!library.library) {
        return c.json({ error: 'Library not found' }, 404);
      }

      if (library.library.id_user !== currentUser.id) {
        return c.json({ error: 'Access denied - Not your library' }, 403);
      }

      await next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error checking library ownership';
      const status = message.includes('Access denied') ? 403 : 500;
      return c.json({ error: message }, status);
    }
  };
}
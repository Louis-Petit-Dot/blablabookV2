import { Hono } from "hono";
import { rateController } from "../controllers/rateController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRateOwnership } from "../middlewares/ownership.ts";
import { errorHandler } from "../middlewares/errorHandler.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const rateRoutes = new Hono();

rateRoutes.use('*', errorHandler);

// GET routes (pas besoin CSRF)
rateRoutes.get('/book/:id/rates', rateController.getBookRates);

// POST/DELETE routes (CSRF requis)
rateRoutes.post('/', jwtMiddleware, csrfProtection(), rateController.createOrUpdateRate);
rateRoutes.delete('/:id', jwtMiddleware, csrfProtection(), requireRateOwnership(), rateController.deleteRate);

export default rateRoutes;
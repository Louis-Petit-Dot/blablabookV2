import type { Context } from "hono";
import { userService } from "../services/userService.ts";
import { recordFailedLogin, recordSuccessfulLogin } from "../middlewares/authLockout.ts";

export const userController = {
    async getAll(c: Context) {
        const users = await userService.getAll();
        return c.json(users);
    },

    async getById(c: Context) {
        const userId = c.req.param('id');
        const result = await userService.getById(userId);
        return c.json(result);
    },

    async login(c: Context) {
        const validatedData = c.get('validatedData'); // Données validées par middleware Zod

        const result = await userService.login(validatedData.email, validatedData.password);

        if (!result) {
            await recordFailedLogin(validatedData.email);
            return c.json({
                error: 'Invalid email or password'
            }, 401);
        }

        await recordSuccessfulLogin(validatedData.email);

        // Envoye JWT en httpOnly cookie (protection XSS)
        const { authUtils } = await import("../middlewares/auth.ts");
        authUtils.setCookieToken(c, result.token);

        // Renvoye le token dans le JSON pour compatibilite des tests/utilitaires clients
    type LoginResult = { token: string } & Record<string, unknown>;
    const { token, ...userWithoutToken } = result as LoginResult;

        return c.json({
            message: 'Login successful',
            token,
            ...userWithoutToken
        });
    },

    async create(c: Context) {
        const validatedData = c.get('validatedData'); // Donnees validees par middleware Zod

        try {
            const result = await userService.create(validatedData);

            // Envoye JWT en httpOnly cookie (protection XSS)
            const { authUtils } = await import("../middlewares/auth.ts");
            authUtils.setCookieToken(c, result.token);

            // Renvoye egalement le token dans la reponse JSON pour faciliter les tests
            type CreateResult = { token: string } & Record<string, unknown>;
            const { token, ...userWithoutToken } = result as CreateResult;

            return c.json({
                ...userWithoutToken,
                token
            }, 201);
        } catch (err) {
            // Si le service renvoie une erreur connue avec un status, exposer un JSON clair
            const maybe = err as { message?: string; status?: number };
            const status = typeof maybe.status === 'number' ? maybe.status : 500;
            const message = maybe.message || 'Internal server error';
            const body = JSON.stringify({ success: false, error: message });
            return new Response(body, { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
        }
    },

    async update(c: Context) {
        const userId = c.req.param('id');
        const validatedData = c.get('validatedData');
        const result = await userService.update(userId, validatedData);
        return c.json(result);
    },

    async updatePassword(c: Context) {
        const userId = c.req.param('id');
        const validatedData = c.get('validatedData');
        await userService.updatePassword(userId, validatedData.current_password, validatedData.new_password);
        return c.json({ message: 'Password updated successfully' });
    },

    async delete(c: Context) {
        const userId = c.req.param('id');
        const result = await userService.delete(userId);
        return c.json({ message: 'User deleted successfully', ...result });
    },

    async logout(c: Context) {
        // Supprime le cookie en le définissant avec Max-Age=0
        const { authUtils } = await import("../middlewares/auth.ts");
        authUtils.clearCookieToken(c);

        return c.json({ message: 'Logout successful' });
    }
};
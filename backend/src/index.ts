import "@std/dotenv/load";
import { Hono } from "hono";
import routes from "./routes/index.ts";
import { securityMiddleware } from "./middlewares/security.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { initKV } from "./services/cache.ts";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";


const app: Hono = new Hono();

// Middleware de securite global
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3000', 'http://localhost:3001','http://localhost:5173', 'http://localhost:5174','https://blablabook.online']

app.use('*', securityMiddleware({
    allowedOrigins: allowedOrigins
}))

app.use('*', errorHandler)

// ROUTES
app.get('/', (c) => {
    return c.text('Hello world Hono!!')
})

app.get('/health', (c) => {
    return c.json({
        status: 'healthy',
        service: 'blablabookv2-api'
    })
})

app.route('/api', routes);


// Port depuis .env
const port = parseInt(Deno.env.get('API_PORT') || '3000')

console.log(`BlaBlaBook API starting on port ${port}`)
console.log(`CORS origins: ${allowedOrigins.join(', ')}`)

// Export pour les tests
export default app;

// Ne demarre le serveur que si ce fichier est execute directement
if (import.meta.main) {
    // Initialise Deno KV au demarrage
    await initKV();

    Deno.serve({ port }, app.fetch)
}
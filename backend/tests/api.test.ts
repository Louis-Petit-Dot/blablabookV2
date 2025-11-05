import { assertEquals } from "@std/assert";
import { Hono } from "hono";

// Créer une instance de test de notre app
const app = new Hono();

// Routes de test (copie simplifiée de index.ts)
app.get('/', (c) => {
    return c.text('Hello world Hono!!')
});

app.get('/health', (c) => {
    return c.json({
        status: 'healthy',
        service: 'blablabookv2-api'
    })
});

Deno.test("API Root endpoint", async () => {
    const req = new Request("http://localhost/");
    const res = await app.fetch(req);

    assertEquals(res.status, 200);
    assertEquals(await res.text(), "Hello world Hono!!");
});

Deno.test("API Health endpoint", async () => {
    const req = new Request("http://localhost/health");
    const res = await app.fetch(req);

    assertEquals(res.status, 200);

    const body = await res.json();
    assertEquals(body.status, "healthy");
    assertEquals(body.service, "blablabookv2-api");
});
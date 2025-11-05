import { assertEquals } from "@std/assert";

const API_URL = "http://localhost:3000";

Deno.test({
  name: "Cookie Authentication Flow",
  fn: async (t) => {
    let csrfToken = "";
    let cookies: string[] = [];

    await t.step("1. Get CSRF Token", async () => {
      const res = await fetch(`${API_URL}/api/csrf-token`);
      const data = await res.json();

      csrfToken = data.csrfToken;

      // Extraire les cookies
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        cookies.push(setCookie.split(";")[0]);
      }

      console.log("✓ CSRF Token:", csrfToken);
    });

    await t.step("2. Login User with httpOnly cookie", async () => {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Cookie": cookies.join("; "),
        },
        body: JSON.stringify({
          email: "testcookie@test.com",
          password: "Test1234!",
        }),
      });

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response body:", data);

      // Extraire le cookie access_token
      const setCookie = res.headers.get("set-cookie");
      console.log("Set-Cookie header:", setCookie);

      if (setCookie) {
        // Vérifier que le cookie est httpOnly
        assertEquals(setCookie.includes("HttpOnly"), true, "Cookie should be HttpOnly");
        assertEquals(setCookie.includes("SameSite=Strict"), true, "Cookie should be SameSite=Strict");
        assertEquals(setCookie.includes("Max-Age=28800"), true, "Cookie should have 8h expiration");

        cookies.push(setCookie.split(";")[0]);
        console.log("✓ Cookie received:", setCookie.split(";")[0]);
      }

      assertEquals(res.status, 200, "Login should succeed");
      assertEquals(data.message, "Login successful", "Response should indicate success");
    });

    await t.step("3. Access protected route with cookie", async () => {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "GET",
        headers: {
          "Cookie": cookies.join("; "),
        },
      });

      console.log("Protected route status:", res.status);

      // Si 200, l'authentification a fonctionné
      // Si 401, le cookie n'a pas été envoyé/lu correctement
      assertEquals(res.status !== 401, true, "Should be authenticated with cookie");
    });

    await t.step("4. Logout clears cookie", async () => {
      const res = await fetch(`${API_URL}/api/users/logout`, {
        method: "POST",
        headers: {
          "Cookie": cookies.join("; "),
        },
      });

      const data = await res.json();
      console.log("Logout response:", data);

      const setCookie = res.headers.get("set-cookie");
      console.log("Logout Set-Cookie:", setCookie);

      if (setCookie) {
        assertEquals(setCookie.includes("Max-Age=0"), true, "Cookie should be cleared");
        console.log("✓ Cookie cleared");
      }

      assertEquals(res.status, 200, "Logout should succeed");
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
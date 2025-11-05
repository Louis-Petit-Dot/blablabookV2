import { assertEquals } from "@std/assert";
import { Hono } from "hono";

// Test unitaire simple pour commencer
Deno.test("Health check test", () => {
  const result = "OK";
  assertEquals(result, "OK");
});

Deno.test("Math operations", () => {
  assertEquals(2 + 2, 4);
  assertEquals(10 - 5, 5);
});
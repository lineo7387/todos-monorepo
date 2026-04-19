import { describe, expect, test } from "vite-plus/test";
import { isCreateTodoInput, normalizeTodoTitle, validateTodoTitle } from "../src/index.ts";

describe("normalizeTodoTitle", () => {
  test("trims and collapses repeated whitespace", () => {
    expect(normalizeTodoTitle("  plan   sprint   review  ")).toBe("plan sprint review");
  });
});

describe("validateTodoTitle", () => {
  test("accepts a valid todo title", () => {
    expect(validateTodoTitle("  buy milk  ")).toEqual({
      ok: true,
      value: "buy milk",
    });
  });

  test("rejects an empty todo title", () => {
    expect(validateTodoTitle("   ")).toEqual({
      ok: false,
      error: "Todo title is required.",
    });
  });

  test("rejects a title longer than 280 characters", () => {
    expect(validateTodoTitle("a".repeat(281))).toEqual({
      ok: false,
      error: "Todo title must be 280 characters or fewer.",
    });
  });
});

describe("isCreateTodoInput", () => {
  test("returns true for a valid create payload", () => {
    expect(isCreateTodoInput({ title: "ship web app" })).toBe(true);
  });

  test("returns false for an invalid create payload", () => {
    expect(isCreateTodoInput({ title: 123 })).toBe(false);
  });
});

import { expect, test } from "bun:test";
import { parseParameters, toPackageName, toSimpleName } from "../src/javadocs-js";

test("Test parseParameters", () => {
  expect(parseParameters("String str")).toEqual([
    { type: "String", name: "str" }
  ]);
  expect(parseParameters("String str, int i")).toEqual([
    { type: "String", name: "str" },
    { type: "int", name: "i" }
  ]);
  expect(parseParameters("")).toEqual([]);
});

test("Test toSimpleName", () => {
  expect(toSimpleName("java.lang.String")).toBe("String");
  expect(toSimpleName("java.lang")).toBe("lang");
  expect(toSimpleName("")).toBe("");
});

test("Test toPackageName", () => {
  expect(toPackageName("java.lang.String")).toBe("java.lang");
  expect(toPackageName("java.lang")).toBe("java");
  expect(toPackageName("")).toBe("");
});
import { test, expect, beforeAll } from "bun:test";
import type { TypeInformation } from "../src/types";
import * as fs from "node:fs";
import { load } from "../src/javadocs-js";

let typeInfo: TypeInformation;
beforeAll(() => {
  typeInfo = load(fs.readFileSync("tests/java11-scanner.html", "utf8"));
});

test("Test typeInfo - Generic information", () => {
  expect(typeInfo.type).toBe("class");
  expect(typeInfo.name).toBe("Scanner");
  expect(typeInfo.inheritance).toEqual(["java.lang.Object"]);
  expect(typeInfo.module).toBe("java.base");
  expect(typeInfo.package).toBe("java.util");
  expect(typeInfo.definition).toBe("public final class Scanner extends Object implements Iterator<String>, Closeable");
});

test("Test typeInfo - Constructors", () => {
  expect(typeInfo.constructors.length).toBe(14);
  expect(typeInfo.constructors[0].parameters).toEqual([
    { name: "source", type: "Readable" },
  ]);
  expect(typeInfo.constructors[2].parameters).toEqual([
    { name: "source", type: "InputStream" },
    { name: "charsetName", type: "String" }
  ]);
})
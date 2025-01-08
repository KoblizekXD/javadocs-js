import { beforeAll, expect, test } from "bun:test";
import * as fs from "node:fs";
import { load } from "../src/javadocs-js";
import type { TypeInformation } from "../src/types";

let typeInfo: TypeInformation;
beforeAll(() => {
  typeInfo = load(fs.readFileSync("tests/java11-system.html", "utf8"));
});

test("Test typeInfo - Generic information", () => {
  expect(typeInfo.type).toBe("class");
  expect(typeInfo.name).toBe("System");
  expect(typeInfo.inheritance).toEqual(["java.lang.Object"]);
  expect(typeInfo.module).toBe("java.base");
  expect(typeInfo.package).toBe("java.lang");
  expect(typeInfo.definition).toBe("public final class System extends Object");
});

test("Test typeInfo - Description", () => {
  expect(typeInfo.description.join("")).toBe(
    "The System class contains several useful class fields and methods. It cannot be instantiated. Among the facilities provided by the System class are standard input, standard output, and error output streams; access to externally defined properties and environment variables; a means of loading files and libraries; and a utility method for quickly copying a portion of an array."
  );
});

test("Test typeInfo - Nested Class Summary", () => {
  expect(typeInfo.nestedClassSummary.length).toEqual(3);
});

test("Test typeInfo - Fields", () => {
  expect(typeInfo.fields.length).not.toEqual(0);
  expect(typeInfo.fields[0].modifiers).toEqual(["public", "static", "final"]);
  expect(typeInfo.fields[0].name).toEqual("in");
});

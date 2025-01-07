import { expect, test } from "bun:test";
import * as fs from "node:fs";
import { getPageInformation } from "../src";

test("Test typeInfo - Generic information", () => {
  const typeInfo = getPageInformation(
    fs.readFileSync("tests/java11-system.html", "utf8")
  );

  expect(typeInfo.type).toBe("class");
  expect(typeInfo.name).toBe("System");
  expect(typeInfo.inheritance).toEqual(["java.lang.Object"]);
  expect(typeInfo.module).toBe("java.base");
  expect(typeInfo.package).toBe("java.lang");
  expect(typeInfo.definition).toBe("public final class System extends Object");
});

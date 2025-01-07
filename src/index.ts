import * as cheerio from "cheerio";
import {
  type ListingType,
  type Method,
  type TypeInformation,
  methodDefRegex,
} from "./types";
const $ = cheerio.load(
  await (
    await fetch(
      "https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/System.html"
    )
  ).text()
);

const stuff = $(".header .title").text().split(" ");

const typeInfo: TypeInformation = {
  type: (stuff[0].toLowerCase() as ListingType) ?? undefined,
  name: stuff[1],
  inheritance: $(".contentContainer .inheritance:first")
    .text()
    .split(/\n+/)
    .filter((it) => it !== "")
    .filter((it, i, arr) => i !== arr.length - 1),
  module: $(".header .subTitle .moduleLabelInType").next().text(),
  package: $(".header .subTitle .packageLabelInType").next().text(),
  description: $(".contentContainer .description .block").text().split(/\n+/),
  definition: $(".contentContainer .blockList pre:first").text(),
  nestedClassSummary: (
    $('h3:contains("Nested Class Summary")')
      .parent()
      .find(".memberSummary tr")
      .get()
      .map((el) => {
        return $(el)
          .find("td, th")
          .map((i, it) => $(it).text())
          .get();
      }) as string[][]
  ).map((it) => ({
    modifiers: it[0].split(" ").map((it) => it.trim()),
    class: it[1],
    description: it[2],
  })),
  fieldSummary: (
    $('h3:contains("Field Summary")')
      .parent()
      .find(".memberSummary tr")
      .get()
      .map((el) => {
        return $(el)
          .find("td, th")
          .map((i, it) => $(it).text())
          .get();
      }) as string[][]
  ).map((it) => ({
    modifiers: it[0].split(" ").map((it) => it.trim()),
    name: it[1],
    description: it[2],
  })),
  methods: [],
};

// console.log(typeInfo);

console.log(
  $('h3:contains("Method Detail")')
    .nextAll("a")
    .get()
    .map((it) => {
      const match = $(it)
        .next()
        .find("pre.methodSignature")
        .text()
        .replace(/\u00A0/g, " ")
        .replace(/\u200B/g, "")
        .replace("\n", "")
        .match(methodDefRegex);
      return {
        modifiers:
          match?.groups?.modifiers.split(" ").map((it) => it.trim()) ?? [],
        returnType: match?.groups?.return ?? "",
        name: match?.groups?.name ?? "",
        parameters: match?.groups?.params.split(", ").map((it) => ({
          name: it.split(" ")[1],
          type: it.split(" ")[0],
        })),
      } as Method;
    })
);

import * as cheerio from "cheerio";
import {
  type ListingType,
  type Method,
  type TypeInformation,
  methodDefRegex,
} from "./types";

export const getPageInformation = (html: string): TypeInformation => {
  const $ = cheerio.load(html);
  const titleInfo = $(".header .title").text().split(" ");

  function parseDl(dl: cheerio.Cheerio): Record<string, string[]> {
    const record: Record<string, string[]> = {};

    let currentKey: string | null = null;

    dl.children().each((_, elem) => {
      const tagName = (elem as cheerio.TagElement).tagName.toLowerCase();
      const text = $(elem).text().trim();

      if (tagName === "dt") {
        currentKey = text;
        if (!record[currentKey]) {
          record[currentKey] = [];
        }
      } else if (tagName === "dd" && currentKey) {
        record[currentKey].push(text);
      }
    });
    return record;
  }

  return {
    type: (titleInfo[0].toLowerCase() as ListingType) ?? undefined,
    name: titleInfo[1],
    inheritance: $(".contentContainer .inheritance:first")
      .text()
      .split(/\n+/)
      .filter((it) => it !== "")
      .filter((it, i, arr) => i !== arr.length - 1),
    module: $(".header .subTitle .moduleLabelInType").next().text(),
    package: $(".header .subTitle .packageLabelInType").next().text(),
    description: $(".contentContainer .description .block").text().split(/\n+/),
    definition: removeUnnecessaryContent(
      $(".contentContainer .blockList pre:first").text()
    ),
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
    methods: $('h3:contains("Method Detail")')
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
          blockTags: parseDl($(it).next().find("dl")),
        } as Method;
      }),
  };
};

export function removeUnnecessaryContent(text: string): string {
  return text
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace("\n", " ");
}

export function toSimpleName(name: string): string {
  return name.split(".").pop() ?? "";
}

export function toPackageName(name: string): string {
  return name.split(".").slice(0, -1).join(".");
}

import * as cheerio from "cheerio";
import {
  type Constructor,
  type Field,
  type ListingType,
  type Method,
  type Parameter,
  type TypeInformation,
  constructorDefRegex,
  fieldDefRegex,
  methodDefRegex,
} from "./types";

/**
 * Attempts to parse the HTML content of a Javadoc class page into
 * a structured object using the Cheerio library.
 * @param html the HTML content of the Javadoc class page
 * @returns the parsed out information
 */
export const load = (html: string): TypeInformation => {
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
    fields: $('h3:contains("Field Detail")')
      .nextAll("a")
      .get()
      .map((it) => {
        const match = $(it)
          .next()
          .find("pre")
          .text()
          .replace(/\u00A0/g, " ")
          .replace(/\u200B/g, "")
          .replace("\n", "")
          .match(fieldDefRegex);

        return {
          modifiers:
            match?.groups?.modifiers.split(" ").map((it) => it.trim()) ?? [],
          type: match?.groups?.return ?? "",
          name: match?.groups?.name ?? "",
          blockTags: parseDl($(it).next().find("dl")),
          description: $(it).next().find(".block").text().split(/\n+/),
        } as Field;
      }),
    constructors: $('h3:contains("Constructor Detail")')
      .nextAll("a")
      .get()
      .map((it) => {
        const match = $(it)
          .next()
          .find("pre")
          .text()
          .replace(/\u00A0/g, " ")
          .replace(/\u200B/g, "")
          .replace("\n", "")
          .match(constructorDefRegex);

        return {
          modifiers:
            match?.groups?.modifiers.split(" ").map((it) => it.trim()) ?? [],
          blockTags: parseDl($(it).next().find("dl")),
          description: $(it).next().find(".block").text().split(/\n+/),
          parameters: parseParameters(match?.groups?.params ?? ""),
        } as Constructor;
      }),
  };
};

export const loadAllClasses = (
  html: string
): Record<string, { type: string; description: string }> => {
  const $ = cheerio.load(html);
  const record: Record<string, { type: string; description: string }> = {};
  $("table.typeSummary")
    .find("tr")
    .get()
    .slice(1)
    .map((it) => {
      const e = $(it).find("td a").attr("title")?.split(" in ");
      if (e) {
        record[`${e[1]}.${$(it).find("td a").text()}`] = {
          type: e[0],
          description: removeUnnecessaryContent(
            $(it).find("th.colLast").text(),
            false
          ),
        };
      }
    });
  return record;
};

console.log(
  loadAllClasses(
    await (
      await fetch(
        "https://docs.oracle.com/en/java/javase/11/docs/api/allclasses-index.html"
      )
    ).text()
  )
);

export function removeUnnecessaryContent(
  text: string,
  replaceEndlines = true
): string {
  return text
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/\n/g, replaceEndlines ? " " : "");
}

export function toSimpleName(name: string): string {
  const result = name.split(".").pop() ?? "";
  if (result === "" || result[0] !== result[0].toUpperCase()) {
    console.warn(`Possible incorrect name: ${name}`);
  }
  return result;
}

export function toPackageName(name: string): string {
  const result = name.split(".").slice(0, -1).join(".");
  const className = name.split(".").pop() ?? "";
  if (
    result === "" ||
    className === "" ||
    className[0] !== className[0].toUpperCase()
  ) {
    console.warn(`Possible incorrect name: ${name}`);
  }
  return result;
}

export function parseParameters(params: string): Parameter[] {
  return params
    .split(/,\s*/)
    .filter((it) => it.length !== 0)
    .map((it) => ({
      name: it.split(" ")[1],
      type: it.split(" ")[0],
    }));
}

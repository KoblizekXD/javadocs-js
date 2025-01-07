export interface TypeInformation {
  type: ListingType;
  name: string;
  package?: string;
  module?: string;
  definition: string;
  inheritance: string[];
  description: string[];
  nestedClassSummary: NestedClassSummary[];
  fieldSummary: FieldSummary[];
  methods: Method[];
}

export const methodDefRegex =
  /(?<modifiers>.+) (?<return>\S+) (?<name>\S+)\((?<params>.*)\)/;

export interface NestedClassSummary {
  modifiers: string[];
  class: string;
  description: string;
}

export interface FieldSummary {
  modifiers: string[];
  name: string;
  description: string;
}

export interface InlineTag {
  name: string;
  value: string;
}

export type ListingType =
  | "class"
  | "interface"
  | "enum"
  | "package"
  | "module"
  | "record"
  | undefined;

export interface Parameter {
  type: string;
  name: string;
}

export interface BlockTag {
  title: string;
  contents: Record<string, string> | string;
}

export interface Method {
  modifiers: string[];
  returnType: string;
  name: string;
  parameters: Parameter[];
  description: string[];
  blockTags: BlockTag[];
}

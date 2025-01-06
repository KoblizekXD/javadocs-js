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
}

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

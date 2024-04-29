import { Matchers, type Token, TokenStream } from "@santerijps/tokenizer";


type Spec = keyof typeof TokenSpecification;


const TokenSpecification = {
  lbrace: "{",
  rbrace: "}",
  lbrack: "[",
  rbrack: "]",
  lparen: "(",
  rparen: ")",
  boolean: /(?:true|false)/i,
  null: /null/i,
  number: Matchers.NumberWithUnderscores,
  string: Matchers.DoubleQuotedMultilineString,
  comment: /#.*$/m,
  identifier: Matchers.AlphabeticUnicodeIdentifier,
  whitespace: Matchers.AnyWhitespace,
  undefined: Matchers.AnyCharacter,
};


export function mion_to_json(text: string) {
  const stream = new TokenStream(text, TokenSpecification);
  return read_record(stream);
}


export async function mion_file_to_json(file_path: string) {
  const fs = await import("node:fs/promises");
  const text = await fs.readFile(file_path, {encoding: "utf-8"});
  return mion_to_json(text);
}


export function json_to_mion(json: any) {
  if (typeof json === "string") {
    return `"${json}"`;
  }

  if (typeof json === "number" || typeof json === "boolean" || json == null) {
    return `${json}`;
  }

  if (Array.isArray(json)) {
    let result = "[\n";
    for (const value of json) {
      if (value instanceof Object && !Array.isArray(value)) {
        result += `{\n${json_to_mion(value)}}\n`;
      } else {
        result += `${json_to_mion(value)}\n`;
      }
    }
    result += "]";
    return result;
  }

  let result = "";
  for (const [key, value] of Object.entries(json)) {
    if (value instanceof Object && !Array.isArray(value)) {
      result += `${key} {\n${json_to_mion(value)}}\n`;
    } else {
      result += `${key} ${json_to_mion(value)}\n`;
    }
  }
  return result;
}


function read_record(stream: TokenStream<Spec>) {
  const result: any = {};
  let expect_key = true;
  let last_key = "";
  let schema: undefined | Carousel<string>;

  while (true) {
    const token = stream.next("comment", "whitespace");
    if (token === null || (expect_key && token.type === "rbrace")) {
      break;
    }
    if (token.type === "undefined") {
      unexpected_token(token);
    }

    if (expect_key && token.type === "identifier") {
      result[token.value] = undefined;
      expect_key = false;
      last_key = token.value;
    }
    else if (!expect_key && token.type !== "identifier") {
      if (token.type === "lparen") {
        try {
          schema = read_schema(stream);
        } catch (error: any) {
          throw Error(`${error.toString()} (ln: ${token.line}, col: ${token.column})`);
        }
      }
      else {
        result[last_key] = read_value(token, stream, schema);
        expect_key = true;
      }
    }
    else {
      unexpected_token(token);
    }
  }

  return result;
}


function read_list(stream: TokenStream<Spec>) {
  const result = new Array();

  while (true) {
    const token = stream.next("comment", "whitespace");
    if (token === null || token.type === "rbrack") {
      break;
    }
    if (token.type === "undefined") {
      unexpected_token(token);
    }

    const list_item = read_value(token, stream);
    result.push(list_item);
  }

  return result;
}


function read_list_with_schema(stream: TokenStream<Spec>, schema: Carousel<string>) {
  const result = new Array();
  let list_item: any = {};

  while (true) {
    const token = stream.next("comment", "whitespace");
    if (token === null || token.type === "rbrack") {
      break;
    }
    if (token.type === "undefined") {
      unexpected_token(token);
    }

    const [key, is_last] = schema.next();
    list_item[key] = read_value(token, stream);

    if (is_last) {
      result.push(list_item);
      list_item = {};
    }
  }

  if (Object.keys(list_item).length > 0) {
    const missing_keys = schema.items.filter((key) => !Object.keys(list_item).includes(key));
    throw Error(`Incomplete list item ${JSON.stringify(list_item)} is missing the following keys: ${missing_keys.join(", ")}`);
  }

  return result;
}


function read_schema(stream: TokenStream<Spec>) {
  const keys = new Array<string>();

  while (true) {
    const token = stream.next("comment", "whitespace");
    if (token === null || token.type === "rparen") {
      break;
    }
    if (token.type !== "identifier") {
      unexpected_token(token);
    }
    keys.push(token.value);
  }

  if (keys.length === 0) {
    throw Error("Empty schema");
  }

  return new Carousel(keys);
}


function read_value(token: Token<Spec>, stream: TokenStream<Spec>, schema?: Carousel<string>) {
  if (token.type === "lbrace") {
    return read_record(stream);
  }
  else if (token.type === "lbrack") {
    if (schema) {
      return read_list_with_schema(stream, schema);
    }
    else {
      return read_list(stream);
    }
  }
  else {
    return token_value_to_js(token);
  }
}


function token_value_to_js(token: Token<Spec>) {
  switch (token.type) {
    case "boolean":
      return token.value.toLowerCase() === "true";
    case "null":
      return null;
    case "number":
      return parseFloat(token.value.replace(/_/g, ""));
    case "string":
      return token.value.slice(1, token.value.length - 1);
    default:
      unexpected_token(token);
  }
}


class Carousel<T> {
  public readonly items: T[];
  private index: number;

  public constructor(items: T[]) {
    this.items = items;
    this.index = 0;
  }

  public next(): [T, boolean] {
    if (this.index >= this.items.length) {
      this.index = 0;
    }
    const item = this.items[this.index];
    return [item, this.index++ === this.items.length - 1];
  }
}


function unexpected_token(token: Token<Spec>) {
  throw Error(`Unexpected token (ln: ${token.line}, col: ${token.column})\n\tType  = ${token.type}\n\tValue = ${token.value}`);
}


export default {json_to_mion, mion_file_to_json, mion_to_json};

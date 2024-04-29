import path from "node:path";
import mion from "..";
import pretty_json from "./pretty.json";

describe("testing index file", () => {
  const pretty_mion_path = path.join(__dirname, "pretty.mion");
  const ugly_mion_path = path.join(__dirname, "ugly.mion");

  test("pretty mion is parsed correctly into json", async () => {
    const json = await mion.mion_file_to_json(pretty_mion_path);
    expect(JSON.stringify(json)).toEqual(JSON.stringify(pretty_json));
  });

  test("ugly mion is parsed correctly into json", async () => {
    const json = await mion.mion_file_to_json(ugly_mion_path);
    expect(JSON.stringify(json)).toEqual(JSON.stringify(pretty_json));
  });

  test("json is converted correctly into mion", async () => {
    const mion_string = mion.json_to_mion(pretty_json);
    const json = mion.mion_to_json(mion_string);
    expect(JSON.stringify(json)).toEqual(JSON.stringify(pretty_json));
  });
});

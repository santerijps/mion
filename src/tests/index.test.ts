import path from "node:path";
import mion from "..";
import expected_json from "./expected.json";

describe("testing index file", () => {
  const pretty_mion_path = path.join(__dirname, "pretty.mion");
  const ugly_mion_path = path.join(__dirname, "ugly.mion");

  test("pretty mion is parsed correctly", async () => {
    const json = await mion.parse_file(pretty_mion_path);
    expect(JSON.stringify(json)).toEqual(JSON.stringify(expected_json));
  });

  test("ugly mion is parsed correctly", async () => {
    const json = await mion.parse_file(ugly_mion_path);
    expect(JSON.stringify(json)).toEqual(JSON.stringify(expected_json));
  });
});

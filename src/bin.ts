#!/usr/bin/env node


import mion from ".";
import fs from "node:fs";


async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0) {
    console.error("No input files provided!");
    process.exit(1);
  }

  if (argv.length > 1) {
    console.warn("Only the first file will be parsed!");
  }

  if (!fs.existsSync(argv[0])) {
    console.error(`File not found: ${argv[0]}`);
    process.exit(1);
  }

  try {
    const json = await mion.mion_file_to_json(argv[0]);
    console.log(JSON.stringify(json, null, 2));
    process.exit(0);
  }
  catch (error: any) {
    console.error(error.toString());
    process.exit(1);
  }
}


main();

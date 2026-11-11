#!/usr/bin/env node
/**
 * export-content-schema.mjs
 *
 * Converts ContentDataSchema (scripts/content-schema.mjs) to JSON Schema 2020-12.
 * Output: public/schema/site-content.schema.json, JSON.stringify(schema, null, 2)
 * plus a trailing newline.
 * Side effects: without --check, creates public/schema/ if needed and overwrites
 * the file; with --check, writes nothing.
 * Exits: with --check, 1 when the committed file is missing or differs from the
 * generated text, else 0.
 *
 * Usage: node scripts/export-content-schema.mjs [--check]
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { ContentDataSchema } from "./content-schema.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/schema/site-content.schema.json");

const artifact = `${JSON.stringify(z.toJSONSchema(ContentDataSchema, { io: "input" }), null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf-8") : "";
  if (current !== artifact) {
    console.error(
      "[export-content-schema] DRIFT: public/schema/site-content.schema.json does not match scripts/content-schema.mjs. Run: npm run schema:export",
    );
    process.exit(1);
  }
  console.log("[export-content-schema] OK — committed artifact matches the schema source.");
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, artifact);
  console.log(`[export-content-schema] wrote ${OUT}`);
}

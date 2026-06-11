#!/usr/bin/env node
/**
 * validate-content.mjs — T-PC-A-03 / T-RD-11 rewrite
 *
 * Build-time gate: validates the 3 locale files in public/content/ against the
 * FULL canonical contract (scripts/content-schema.mjs — the same schema the
 * admin panel consumes as JSON Schema). Was: projectsV2-only, inline schema
 * copy, src/data/content path.
 *
 * Usage:  node scripts/validate-content.mjs
 * Exit:   0 on success, 1 on any validation error.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ContentDataSchema } from "./content-schema.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../public/content");
const LOCALES = ["pt", "en", "de"];

let failed = false;

for (const locale of LOCALES) {
  const path = resolve(DATA_DIR, `${locale}.json`);
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf-8"));
  } catch (err) {
    console.error(`[validate-content] ERROR: cannot read/parse ${locale}.json — ${err.message}`);
    failed = true;
    continue;
  }

  const result = ContentDataSchema.safeParse(data);
  if (!result.success) {
    failed = true;
    console.error(`[validate-content] ERROR: ${locale}.json failed the content contract:`);
    for (const issue of result.error.issues.slice(0, 20)) {
      console.error(`  [${issue.path.join(".")}] ${issue.message}`);
    }
  } else {
    const d = result.data;
    console.log(
      `[validate-content] OK: ${locale}.json — schema v${d.schema_version}, ` +
        `${d.experiences.length} experience(s), ${d.certifications.length} cert(s), ` +
        `${d.projectsV2.list.length} project(s).`,
    );
  }
}

if (failed) {
  console.error("\n[validate-content] FAILED — fix errors above before building.");
  process.exit(1);
}
console.log("\n[validate-content] All locales valid against the v1 contract.");

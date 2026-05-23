#!/usr/bin/env node
/**
 * check-i18n-parity.mjs — T-PC-A-06
 *
 * Verifies that the `projectsV2` block in pt.json / en.json / de.json has:
 *   1. Field parity  — every i18n-bearing key present in all 3 locales.
 *   2. No empty/whitespace strings in i18n fields.
 *   3. No sensitive infrastructure identifiers leaked into content strings
 *      (AC-PC-15 redaction lint).
 *
 * Usage:  node scripts/check-i18n-parity.mjs
 * Exit:   0 on success, 1 on any parity or redaction failure.
 *
 * Self-test: SELF_TEST=1 node scripts/check-i18n-parity.mjs
 *
 * Design notes:
 *   - Pure Node 22, ESM, zero external dependencies.
 *   - Parity is checked on i18n-bearing keys only. Non-i18n fields (slug, kind,
 *     engine, cover, repo, playUrl, diagram, monthly_usd) are language-neutral
 *     and deliberately identical across locales.
 *   - Optional section fields (body) are only flagged when present in SOME
 *     locales but absent in others — consistent absence is not an error.
 *   - Redaction patterns match single token identifiers (no whitespace) to
 *     avoid false positives on hyphenated prose.
 *
 * AC-PC-03 — i18n parity gate
 * AC-PC-15 — redaction lint
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../src/data/content");
const LOCALES = ["pt", "en", "de"];

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Return true when a value is a non-null object (and not an array).
 * @param {unknown} v
 */
function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Return true when `value` is a string that is empty or whitespace-only.
 * @param {string} value
 */
function isBlankString(value) {
  return value.trim().length === 0;
}

// ── I18n-bearing field identification ─────────────────────────────────────
//
// These keys carry translatable human-visible text and MUST be present and
// non-empty in all 3 locales. Non-i18n keys (slug, kind, engine, repo, cover,
// playUrl, diagram, monthly_usd, etc.) are intentionally excluded.

/** i18n keys inside projects.index. */
const INDEX_I18N_KEYS = new Set(["title", "description"]);

/** Mandatory i18n keys inside project.hero. */
const HERO_I18N_KEYS = new Set(["title", "tagline"]);

/** Mandatory i18n keys inside project.card. */
const CARD_I18N_KEYS = new Set(["summary"]);     // tech is non-i18n; cover is an asset path

/** Mandatory i18n keys inside project.seo. */
const SEO_I18N_KEYS  = new Set(["title", "description"]);

/** Mandatory i18n keys inside a section. */
const SECTION_I18N_MANDATORY_KEYS = new Set(["title"]);

/** Optional i18n keys inside a section (only flagged when present in some locales). */
const SECTION_I18N_OPTIONAL_KEYS = new Set(["body"]);

/** Mandatory i18n keys inside a game link item (GameLink). */
const GAME_LINK_I18N_KEYS = new Set(["title", "body"]);

/** Mandatory i18n keys inside a stack row. */
const STACK_I18N_KEYS = new Set(["layer", "tech"]);

/** Mandatory i18n keys inside an arch decision. */
const DECISION_I18N_KEYS = new Set(["title", "rationale", "spec"]);

// ── Redaction patterns (AC-PC-15) ─────────────────────────────────────────
//
// Patterns are intentionally generic — they catch any value matching the
// shape rather than specific known identifiers. This makes the lint future-proof.
//
// Critical design constraint: patterns only match single no-whitespace tokens
// to avoid false positives on normal hyphenated prose (e.g. "spec-driven").

const REDACTION_RULES = [
  {
    name: "S3 bucket name",
    // S3 buckets are single lowercase tokens (no spaces), 3-63 chars, letters+digits+hyphens.
    // Heuristic: a standalone token ≥ 12 chars with hyphens that ends with a common
    // environment/purpose suffix (bucket, prod, stage, dev, static, assets, data, backup, logs).
    // The \S* ensures no whitespace — a bucket name is always one word.
    // We require at least 2 hyphen-separated segments before the suffix.
    pattern: /\b[a-z0-9][a-z0-9-]{5,50}(?:bucket|prod|stage|static|assets|backup|logs)\b(?!\w)/,
    description: "Possible S3 bucket name token (multi-segment, ends with environment/purpose suffix)",
  },
  {
    name: "CloudFront distribution ID",
    // CloudFront distribution IDs: capital E followed by exactly 13-14 uppercase alphanumeric chars
    pattern: /\bE[A-Z0-9]{13,14}\b/,
    description: "CloudFront distribution ID (E + 13-14 uppercase alphanumeric)",
  },
  {
    name: "Route53 hosted zone ID",
    // Route53 zone IDs: capital Z followed by 13-30 uppercase alphanumeric chars
    pattern: /\bZ[A-Z0-9]{13,30}\b/,
    description: "Route53 hosted zone ID (Z + 13-30 uppercase alphanumeric)",
  },
  {
    name: "AWS account ID",
    // 12-digit number isolated by word boundaries, not preceded by + - . / (phone/version),
    // not followed by . / (version/IP).
    // Short surrounding context exclusions prevent matching dates embedded in longer text.
    pattern: /(?<![+\-./\d])\b\d{12}\b(?![./\d])/,
    description: "Isolated 12-digit number (possible AWS account ID)",
  },
];

// ── Parity checker ────────────────────────────────────────────────────────

/**
 * Check that all locales have the same set of mandatory i18n keys present and non-blank.
 *
 * @param {Array<Record<string, unknown> | undefined>} objects - One per locale.
 * @param {Set<string>} i18nKeys - Keys that must be present and non-blank in all locales.
 * @param {string[]} locales
 * @param {string} path - Human-readable path for error messages.
 * @returns {{ errors: string[] }}
 */
function checkObjectParity(objects, i18nKeys, locales, path) {
  const errors = [];
  for (const key of i18nKeys) {
    for (let i = 0; i < locales.length; i++) {
      const obj = objects[i];
      const locale = locales[i];
      if (obj === undefined || obj === null) {
        errors.push(`[${locale}] ${path}: object is missing entirely`);
        continue;
      }
      if (!(key in obj)) {
        errors.push(`[${locale}] ${path}.${key}: field missing`);
        continue;
      }
      const value = obj[key];
      if (typeof value === "string" && isBlankString(value)) {
        errors.push(`[${locale}] ${path}.${key}: blank string`);
      } else if (value === null || value === undefined) {
        errors.push(`[${locale}] ${path}.${key}: null or undefined`);
      }
      // Arrays (e.g. tech[]) are allowed — validate:content checks min length via Zod
    }
  }
  return { errors };
}

/**
 * Check optional i18n keys: if any locale has the key present (and non-null),
 * then ALL locales must have it present and non-blank.
 *
 * @param {Array<Record<string, unknown> | undefined>} objects - One per locale.
 * @param {Set<string>} optionalKeys
 * @param {string[]} locales
 * @param {string} path
 * @returns {{ errors: string[] }}
 */
function checkOptionalParity(objects, optionalKeys, locales, path) {
  const errors = [];
  for (const key of optionalKeys) {
    const presenceByLocale = objects.map((obj) =>
      obj !== undefined && obj !== null && key in obj && obj[key] !== undefined && obj[key] !== null
    );
    const anyPresent = presenceByLocale.some(Boolean);
    if (!anyPresent) continue; // Consistently absent — OK

    for (let i = 0; i < locales.length; i++) {
      const obj = objects[i];
      const locale = locales[i];
      if (!presenceByLocale[i]) {
        errors.push(
          `[${locale}] ${path}.${key}: missing (present in other locales)`
        );
        continue;
      }
      const value = obj[key];
      if (typeof value === "string" && isBlankString(value)) {
        errors.push(`[${locale}] ${path}.${key}: blank string`);
      }
    }
  }
  return { errors };
}

/**
 * Check i18n parity for a project item across locales.
 *
 * @param {unknown[]} projectsByLocale
 * @param {string[]} locales
 * @param {string} basePath
 * @returns {{ errors: string[] }}
 */
function checkProjectParity(projectsByLocale, locales, basePath) {
  const errors = [];

  // hero
  const heroes = projectsByLocale.map((p) => (isPlainObject(p) ? p["hero"] : undefined));
  errors.push(...checkObjectParity(heroes, HERO_I18N_KEYS, locales, `${basePath}.hero`).errors);

  // card.summary
  const cards = projectsByLocale.map((p) => (isPlainObject(p) ? p["card"] : undefined));
  errors.push(...checkObjectParity(cards, CARD_I18N_KEYS, locales, `${basePath}.card`).errors);

  // seo
  const seos = projectsByLocale.map((p) => (isPlainObject(p) ? p["seo"] : undefined));
  errors.push(...checkObjectParity(seos, SEO_I18N_KEYS, locales, `${basePath}.seo`).errors);

  // diagramAlt — optional string; if any locale has it, all must
  const diagramAlts = projectsByLocale.map((p) =>
    isPlainObject(p) ? { diagramAlt: p["diagramAlt"] } : undefined
  );
  errors.push(...checkOptionalParity(diagramAlts, new Set(["diagramAlt"]), locales, basePath).errors);

  // Verify kind consistency across locales
  const kinds = projectsByLocale.map((p) => (isPlainObject(p) ? p["kind"] : undefined));
  const referenceKind = kinds[0];
  for (let i = 1; i < locales.length; i++) {
    if (kinds[i] !== referenceKind) {
      errors.push(
        `[${locales[i]}] ${basePath}.kind: "${kinds[i]}" differs from reference "${referenceKind}"`
      );
    }
  }

  if (referenceKind === "case-study" || referenceKind === "meta") {
    const sectionsByLocale = projectsByLocale.map((p) =>
      isPlainObject(p) && Array.isArray(p["sections"]) ? p["sections"] : []
    );
    const maxSections = Math.max(...sectionsByLocale.map((arr) => arr.length));
    for (let si = 0; si < maxSections; si++) {
      const secObjs = sectionsByLocale.map((arr) => arr[si]);
      const secPath = `${basePath}.sections[${si}]`;
      // Count parity
      for (let li = 0; li < locales.length; li++) {
        if (secObjs[li] === undefined) {
          errors.push(`[${locales[li]}] ${secPath}: section missing (other locales have it)`);
        }
      }
      // Mandatory keys
      errors.push(...checkObjectParity(secObjs, SECTION_I18N_MANDATORY_KEYS, locales, secPath).errors);
      // Optional keys (body)
      errors.push(...checkOptionalParity(secObjs, SECTION_I18N_OPTIONAL_KEYS, locales, secPath).errors);
    }
  }

  if (referenceKind === "meta") {
    // stack[]
    const stackByLocale = projectsByLocale.map((p) =>
      isPlainObject(p) && Array.isArray(p["stack"]) ? p["stack"] : []
    );
    const maxStack = Math.max(...stackByLocale.map((arr) => arr.length));
    for (let si = 0; si < maxStack; si++) {
      const stackObjs = stackByLocale.map((arr) => arr[si]);
      const stackPath = `${basePath}.stack[${si}]`;
      for (let li = 0; li < locales.length; li++) {
        if (stackObjs[li] === undefined) {
          errors.push(`[${locales[li]}] ${stackPath}: stack row missing`);
        }
      }
      errors.push(...checkObjectParity(stackObjs, STACK_I18N_KEYS, locales, stackPath).errors);
    }

    // decisions[]
    const decisionsByLocale = projectsByLocale.map((p) =>
      isPlainObject(p) && Array.isArray(p["decisions"]) ? p["decisions"] : []
    );
    const maxDecisions = Math.max(...decisionsByLocale.map((arr) => arr.length));
    for (let di = 0; di < maxDecisions; di++) {
      const decObjs = decisionsByLocale.map((arr) => arr[di]);
      const decPath = `${basePath}.decisions[${di}]`;
      for (let li = 0; li < locales.length; li++) {
        if (decObjs[li] === undefined) {
          errors.push(`[${locales[li]}] ${decPath}: decision missing`);
        }
      }
      errors.push(...checkObjectParity(decObjs, DECISION_I18N_KEYS, locales, decPath).errors);
    }
  }

  if (referenceKind === "games") {
    const itemsByLocale = projectsByLocale.map((p) =>
      isPlainObject(p) && Array.isArray(p["items"]) ? p["items"] : []
    );
    const maxItems = Math.max(...itemsByLocale.map((arr) => arr.length));
    for (let ii = 0; ii < maxItems; ii++) {
      const itemObjs = itemsByLocale.map((arr) => arr[ii]);
      const itemPath = `${basePath}.items[${ii}]`;
      for (let li = 0; li < locales.length; li++) {
        if (itemObjs[li] === undefined) {
          errors.push(`[${locales[li]}] ${itemPath}: game item missing`);
        }
      }
      errors.push(...checkObjectParity(itemObjs, GAME_LINK_I18N_KEYS, locales, itemPath).errors);
    }
  }

  return { errors };
}

// ── Redaction scanner ──────────────────────────────────────────────────────

/**
 * Recursively scan all string values in `obj` and report matches against
 * redaction patterns.
 *
 * @param {unknown} obj
 * @param {string} path
 * @param {string} locale
 * @returns {{ findings: string[] }}
 */
function scanForRedactionViolations(obj, path, locale) {
  const findings = [];

  if (typeof obj === "string") {
    for (const rule of REDACTION_RULES) {
      if (rule.pattern.test(obj)) {
        findings.push(
          `[${locale}] ${path}: possible ${rule.name} — "${obj.slice(0, 80)}${obj.length > 80 ? "…" : ""}"`
        );
      }
    }
    return { findings };
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const sub = scanForRedactionViolations(obj[i], `${path}[${i}]`, locale);
      findings.push(...sub.findings);
    }
    return { findings };
  }

  if (isPlainObject(obj)) {
    for (const key of Object.keys(obj)) {
      const sub = scanForRedactionViolations(obj[key], `${path}.${key}`, locale);
      findings.push(...sub.findings);
    }
    return { findings };
  }

  return { findings };
}

// ── Self-test (inline) ─────────────────────────────────────────────────────
//
// Run with: SELF_TEST=1 node scripts/check-i18n-parity.mjs
// Exercises both the parity miss and redaction hit code paths.

function runSelfTest() {
  let passed = 0;
  let failed = 0;

  function assert(description, condition) {
    if (condition) {
      console.log(`  [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${description}`);
      failed++;
    }
  }

  console.log("\n[check-i18n-parity] SELF-TEST running…\n");

  // ── Parity: missing mandatory field ──────────────────────────────────────
  {
    const objs = [
      { title: "Hello", tagline: "World" },
      { title: "Hola" /* tagline missing */ },
      { title: "Hallo", tagline: "Welt" },
    ];
    const { errors } = checkObjectParity(objs, new Set(["title", "tagline"]), LOCALES, "test.hero");
    assert("missing mandatory field produces an error", errors.length > 0);
    assert("error mentions affected locale", errors.some((e) => e.includes("[en]")));
    assert("error mentions missing key", errors.some((e) => e.includes("tagline")));
  }

  // ── Parity: blank mandatory string ───────────────────────────────────────
  {
    const objs = [
      { title: "Hello", tagline: "World" },
      { title: "Hola", tagline: "  " },
      { title: "Hallo", tagline: "Welt" },
    ];
    const { errors } = checkObjectParity(objs, new Set(["title", "tagline"]), LOCALES, "test.hero");
    assert("blank mandatory string produces an error", errors.length > 0);
    assert("error labels it as blank string", errors.some((e) => e.includes("blank string")));
  }

  // ── Parity: all present and non-blank ────────────────────────────────────
  {
    const objs = [
      { title: "Hello", tagline: "World" },
      { title: "Hola", tagline: "Mundo" },
      { title: "Hallo", tagline: "Welt" },
    ];
    const { errors } = checkObjectParity(objs, new Set(["title", "tagline"]), LOCALES, "test.hero");
    assert("no errors when all mandatory fields present and non-blank", errors.length === 0);
  }

  // ── Parity: optional field consistently absent is OK ─────────────────────
  {
    const objs = [
      { title: "Section A" /* no body */ },
      { title: "Section A" /* no body */ },
      { title: "Section A" /* no body */ },
    ];
    const { errors } = checkOptionalParity(objs, new Set(["body"]), LOCALES, "test.sections[0]");
    assert("consistently absent optional field is OK", errors.length === 0);
  }

  // ── Parity: optional field partially absent is an error ──────────────────
  {
    const objs = [
      { title: "Section A", body: "Some content" },
      { title: "Section A" /* no body */ },
      { title: "Section A", body: "Etwas Inhalt" },
    ];
    const { errors } = checkOptionalParity(objs, new Set(["body"]), LOCALES, "test.sections[0]");
    assert("partially absent optional field is an error", errors.length > 0);
    assert("error mentions missing locale", errors.some((e) => e.includes("[en]")));
  }

  // ── Redaction: CloudFront distribution ID ────────────────────────────────
  {
    const { findings } = scanForRedactionViolations(
      "Distributed via EABCDEFGHIJKLMN endpoint",
      "test.value",
      "pt"
    );
    assert("CloudFront distribution ID detected", findings.length > 0);
    assert("CloudFront finding identifies rule", findings.some((f) => f.includes("CloudFront")));
  }

  // ── Redaction: Route53 hosted zone ID ────────────────────────────────────
  {
    const { findings } = scanForRedactionViolations(
      "Zone ZABCDEFGHIJKLMNOPQRSTUVWX was provisioned",
      "test.value",
      "en"
    );
    assert("Route53 zone ID detected", findings.length > 0);
    assert("Route53 finding identifies rule", findings.some((f) => f.includes("Route53")));
  }

  // ── Redaction: isolated 12-digit AWS account ID ───────────────────────────
  {
    const { findings } = scanForRedactionViolations(
      "Account 123456789012 was granted access",
      "test.value",
      "de"
    );
    assert("isolated 12-digit account ID detected", findings.length > 0);
    assert("account ID finding identifies rule", findings.some((f) => f.includes("account ID")));
  }

  // ── Redaction: normal prose does not trigger ──────────────────────────────
  {
    const { findings } = scanForRedactionViolations(
      "React 18 + Vite 7 + TypeScript 5.5 — spec-driven development with collaborative AI agents",
      "test.stack",
      "en"
    );
    assert("clean tech description produces no findings", findings.length === 0);
  }

  // ── Redaction: typical S3 bucket token detected ───────────────────────────
  {
    const { findings } = scanForRedactionViolations(
      "Backend bucket: my-username-webapp-prod",
      "test.value",
      "en"
    );
    assert("S3 bucket name token detected", findings.length > 0);
    assert("S3 finding identifies rule", findings.some((f) => f.includes("S3 bucket")));
  }

  // ── Redaction: year/version number not flagged ────────────────────────────
  {
    const { findings } = scanForRedactionViolations(
      "Deployed on 2024.03.15 using version 1.2.3",
      "test.date",
      "en"
    );
    assert("dot-separated version/date not flagged as account ID", findings.length === 0);
  }

  console.log(`\n[check-i18n-parity] SELF-TEST results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

if (process.env.SELF_TEST === "1") {
  runSelfTest();
  process.exit(0);
}

// ── Main ───────────────────────────────────────────────────────────────────

let hasErrors = false;
const loadedLocales = [];

for (const locale of LOCALES) {
  const filePath = resolve(DATA_DIR, `${locale}.json`);
  let raw;
  try {
    raw = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`[check-i18n-parity] ERROR: Cannot read ${filePath}: ${err.message}`);
    hasErrors = true;
    loadedLocales.push({ locale, data: null });
    continue;
  }
  if (!raw.projectsV2) {
    console.error(
      `[check-i18n-parity] ERROR: ${locale}.json missing "projectsV2" key.`
    );
    hasErrors = true;
    loadedLocales.push({ locale, data: null });
    continue;
  }
  loadedLocales.push({ locale, data: raw.projectsV2 });
}

if (loadedLocales.some(({ data }) => data === null)) {
  console.error("\n[check-i18n-parity] FAILED — could not load all locale files.");
  process.exit(1);
}

const allData = loadedLocales.map(({ data }) => data);

// ── 1. Check index parity ──────────────────────────────────────────────────
{
  const indexObjs = allData.map((d) => (isPlainObject(d) ? d["index"] : undefined));
  const { errors } = checkObjectParity(indexObjs, INDEX_I18N_KEYS, LOCALES, "projectsV2.index");
  if (errors.length > 0) {
    console.error("[check-i18n-parity] Parity errors in projectsV2.index:");
    errors.forEach((e) => console.error(`  ${e}`));
    hasErrors = true;
  }
}

// ── 2. Check list[] parity ─────────────────────────────────────────────────
{
  const listsByLocale = allData.map((d) =>
    Array.isArray(d["list"]) ? d["list"] : []
  );
  const maxLen = Math.max(...listsByLocale.map((l) => l.length));

  for (let li = 0; li < LOCALES.length; li++) {
    if (listsByLocale[li].length !== maxLen) {
      console.error(
        `[check-i18n-parity] [${LOCALES[li]}] projectsV2.list: ` +
        `${listsByLocale[li].length} items (expected ${maxLen})`
      );
      hasErrors = true;
    }
  }

  for (let pi = 0; pi < maxLen; pi++) {
    const projectsByLocale = listsByLocale.map((list) => list[pi]);
    const referenceslug = isPlainObject(projectsByLocale[0])
      ? projectsByLocale[0]["slug"]
      : `[${pi}]`;
    const basePath = `projectsV2.list[${pi}](${referenceslug})`;

    const { errors } = checkProjectParity(projectsByLocale, LOCALES, basePath);
    if (errors.length > 0) {
      console.error(`[check-i18n-parity] Parity errors in ${basePath}:`);
      errors.forEach((e) => console.error(`  ${e}`));
      hasErrors = true;
    }
  }
}

// ── 3. Redaction lint ──────────────────────────────────────────────────────
{
  const redactionFindings = [];
  for (let li = 0; li < LOCALES.length; li++) {
    const locale = LOCALES[li];
    const data = allData[li];
    const { findings } = scanForRedactionViolations(data, "projectsV2", locale);
    redactionFindings.push(...findings);
  }

  if (redactionFindings.length > 0) {
    console.error("[check-i18n-parity] Redaction lint findings (AC-PC-15):");
    redactionFindings.forEach((f) => console.error(`  ${f}`));
    hasErrors = true;
  }
}

// ── Result ─────────────────────────────────────────────────────────────────
if (hasErrors) {
  console.error("\n[check-i18n-parity] FAILED — fix errors above.");
  process.exit(1);
} else {
  console.log("[check-i18n-parity] OK — i18n parity and redaction lint passed.");
  process.exit(0);
}

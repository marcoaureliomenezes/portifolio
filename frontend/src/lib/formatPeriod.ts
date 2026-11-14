import type { SupportedLanguages } from "@/types/content";

const PRESENT_KEYWORDS = new Set(["presente", "present", "heute"]);
const SEPARATOR = / (?:a|to|bis) /;

type YearMonth = { month: number; year: number };

function parseDatePart(s: string): YearMonth | null {
  const m = s.trim().match(/^(\d{2})[-/](\d{4})$/);
  if (!m) return null;
  return { month: parseInt(m[1], 10), year: parseInt(m[2], 10) };
}

function parseSpan(raw: string) {
  const [startStr, endStr] = raw.replace(/\s*\([^)]*\)\s*$/, "").split(SEPARATOR);
  const start = parseDatePart(startStr);
  return start && endStr !== undefined ? { start, end: endStr.trim() } : null;
}

function fmtMonth(d: YearMonth, lang: SupportedLanguages): string {
  return new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }).format(
    Date.UTC(d.year, d.month - 1, 1),
  );
}

function fmtDuration(start: YearMonth, end: YearMonth, lang: SupportedLanguages): string {
  const total = (end.year - start.year) * 12 + (end.month - start.month);
  if (total <= 0) return "";
  return ([["year", Math.floor(total / 12)], ["month", total % 12]] as const)
    .filter(([, n]) => n > 0)
    .map(([unit, n]) => new Intl.NumberFormat(lang, { style: "unit", unit }).format(n))
    .join(" ");
}

/**
 * Renders "Mon YYYY – Mon YYYY · X yrs Y mos" in the locale's words, from the raw dates.
 * A trailing "(…)" suffix is dropped and the duration recomputed. An open end renders
 * the source's own word. Returns the input unchanged when it does not parse.
 */
export function formatPeriod(raw: string, lang: SupportedLanguages): string {
  const span = parseSpan(raw);
  if (!span) return raw;

  const { start, end: endStr } = span;
  const isPresent = PRESENT_KEYWORDS.has(endStr.toLowerCase());
  const now = new Date();
  const end = isPresent ? { month: now.getMonth() + 1, year: now.getFullYear() } : parseDatePart(endStr);
  if (!end) return raw;

  const startLabel = fmtMonth(start, lang);
  const endLabel = isPresent ? endStr : fmtMonth(end, lang);
  const duration = fmtDuration(start, end, lang);
  return duration ? `${startLabel} – ${endLabel} · ${duration}` : `${startLabel} – ${endLabel}`;
}

/** "04-2015 a 07-2018" to "2015–18"; the input unchanged when it does not parse or has an open end. */
export function yearRange(raw: string): string {
  const span = parseSpan(raw);
  const end = span && parseDatePart(span.end);
  if (!span || !end) return raw;
  const from = span.start.year;
  return end.year === from ? `${from}` : `${from}–${String(end.year % 100).padStart(2, "0")}`;
}

/** Whole years from the earliest parsable start to `now`; 0 when no period parses. */
export function yearsSince(periods: string[], now = new Date()): number {
  const starts = periods.flatMap(p => {
    const span = parseSpan(p);
    return span ? [span.start.year * 12 + span.start.month - 1] : [];
  });
  if (starts.length === 0) return 0;
  const nowMonths = now.getFullYear() * 12 + now.getMonth();
  return Math.max(0, Math.floor((nowMonths - Math.min(...starts)) / 12));
}

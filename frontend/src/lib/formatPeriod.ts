const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const PRESENT_KEYWORDS = new Set(["presente", "present", "heute"]);
const SEPARATORS = [" a ", " to ", " bis "];

function parseDatePart(s: string): { month: number; year: number } | null {
  const m = s.trim().match(/^(\d{2})[-/](\d{4})$/);
  if (!m) return null;
  return { month: parseInt(m[1], 10), year: parseInt(m[2], 10) };
}

function fmtDate(d: { month: number; year: number }): string {
  return `${MONTHS[d.month - 1]} ${d.year}`;
}

function fmtDuration(start: { month: number; year: number }, end: { month: number; year: number }): string {
  const total = (end.year - start.year) * 12 + (end.month - start.month);
  if (total <= 0) return "";
  const yrs = Math.floor(total / 12);
  const mos = total % 12;
  const parts: string[] = [];
  if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
  if (mos > 0) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
  return parts.join(" ");
}

/**
 * Normalises any period string stored in the locale JSONs to:
 *   "Mon YYYY – Mon YYYY · X yrs Y mos"
 * Handles PT ("a"), EN ("to"), DE ("bis") separators and recalculates
 * duration from the raw dates, discarding any existing "(Xy Zm)" suffix.
 */
export function formatPeriod(raw: string): string {
  const cleaned = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const sep = SEPARATORS.find(s => cleaned.includes(s));
  if (!sep) return raw;

  const [startStr, endStr] = cleaned.split(sep);
  const start = parseDatePart(startStr);
  if (!start) return raw;

  const endTrimmed = endStr.trim();
  const isPresent = PRESENT_KEYWORDS.has(endTrimmed.toLowerCase());
  const now = new Date();
  const end = isPresent
    ? { month: now.getMonth() + 1, year: now.getFullYear() }
    : parseDatePart(endTrimmed);
  if (!end) return raw;

  const endLabel = isPresent ? "Present" : fmtDate(end);
  const duration = fmtDuration(start, end);
  return duration ? `${fmtDate(start)} – ${endLabel} · ${duration}` : `${fmtDate(start)} – ${endLabel}`;
}

/**
 * Operator profile constants — single source of truth for social/contact URLs.
 * Consumed by ContactStrip, Header, and any future component that links out.
 * T-FE-06
 */
export const profile = {
  linkedinUrl: "https://www.linkedin.com/in/marco-menezes-731542b9",
  githubUrl: "https://github.com/marcoaureliomenezes",
  email: "marcoaurelioreislima@gmail.com",
  /** Canonical PT CV — always present in /public. Used as fallback for all locales. */
  cvDownloadUrl: "/cv.pdf",
} as const;

/**
 * Locale-keyed CV PDF paths — T-FE-QUAL-10.
 *
 * Returns the locale-specific PDF path when the asset exists in /public,
 * or falls back to the PT original (/cv.pdf) for locales without a dedicated
 * translation yet.
 *
 * When operator supplies EN / DE PDFs, add them to frontend/public/ as
 * `cv-en.pdf` and `cv-de.pdf` — this function resolves them automatically.
 *
 * NOTE: Asset availability is declarative here. The actual 404 behaviour is
 * handled by the browser; the component falls back gracefully via the `onError`
 * pattern (or simply by checking the list below before switching locale).
 */
const CV_LOCALE_MAP: Record<string, string> = {
  pt: "/cv.pdf",
  // en: "/cv-en.pdf",   // uncomment when operator supplies cv-en.pdf
  // de: "/cv-de.pdf",   // uncomment when operator supplies cv-de.pdf
};

/**
 * Returns the CV download URL for the given locale.
 * Falls back to the PT PDF for any locale without a dedicated asset.
 *
 * @param locale - short locale code ("pt" | "en" | "de")
 */
export function getCvUrl(locale: string): string {
  return CV_LOCALE_MAP[locale] ?? profile.cvDownloadUrl;
}

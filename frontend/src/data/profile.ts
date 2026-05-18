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
 * Operator decision (2026-05-17): a single PT PDF serves all locales.
 * To introduce dedicated EN/DE translations later, drop `cv-en.pdf` /
 * `cv-de.pdf` into `frontend/public/` and repoint the matching entry below.
 */
const CV_LOCALE_MAP: Record<string, string> = {
  pt: "/cv.pdf",
  en: "/cv.pdf",
  de: "/cv.pdf",
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

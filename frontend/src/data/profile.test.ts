/**
 * profile.test.ts — T-FE-QUAL-10
 *
 * Operator decision (2026-05-17): single PT PDF serves all locales.
 * Update these assertions when dedicated EN/DE PDFs are added.
 */

import { describe, it, expect } from "vitest";
import { getCvUrl, profile } from "./profile";

describe("getCvUrl — locale-keyed CV routing (T-FE-QUAL-10)", () => {
  it("returns /cv.pdf for 'pt' locale", () => {
    expect(getCvUrl("pt")).toBe("/cv.pdf");
  });

  it("returns /cv.pdf for 'en' locale (shared PT asset by operator decision)", () => {
    expect(getCvUrl("en")).toBe("/cv.pdf");
  });

  it("returns /cv.pdf for 'de' locale (shared PT asset by operator decision)", () => {
    expect(getCvUrl("de")).toBe("/cv.pdf");
  });

  it("falls back to /cv.pdf for an unknown locale string", () => {
    expect(getCvUrl("fr")).toBe(profile.cvDownloadUrl);
  });

  it("cvDownloadUrl on profile constant is /cv.pdf", () => {
    expect(profile.cvDownloadUrl).toBe("/cv.pdf");
  });
});

/**
 * profile.test.ts — T-FE-QUAL-10
 *
 * Tests for locale-keyed CV URL routing via getCvUrl().
 * AC:
 *   - "pt" locale returns /cv.pdf (canonical PT asset)
 *   - "en" locale falls back to /cv.pdf (EN PDF not yet in /public)
 *   - "de" locale falls back to /cv.pdf (DE PDF not yet in /public)
 *   - unknown locale falls back to /cv.pdf
 *
 * When operator supplies cv-en.pdf / cv-de.pdf, uncomment the entries in
 * CV_LOCALE_MAP and update these tests to assert the locale-specific paths.
 */

import { describe, it, expect } from "vitest";
import { getCvUrl, profile } from "./profile";

describe("getCvUrl — locale-keyed CV routing (T-FE-QUAL-10)", () => {
  it("returns /cv.pdf for 'pt' locale", () => {
    expect(getCvUrl("pt")).toBe("/cv.pdf");
  });

  it("falls back to /cv.pdf for 'en' locale (PDF asset pending from operator)", () => {
    // When operator supplies frontend/public/cv-en.pdf, this test should be
    // updated to: expect(getCvUrl("en")).toBe("/cv-en.pdf")
    expect(getCvUrl("en")).toBe(profile.cvDownloadUrl);
  });

  it("falls back to /cv.pdf for 'de' locale (PDF asset pending from operator)", () => {
    // When operator supplies frontend/public/cv-de.pdf, this test should be
    // updated to: expect(getCvUrl("de")).toBe("/cv-de.pdf")
    expect(getCvUrl("de")).toBe(profile.cvDownloadUrl);
  });

  it("falls back to /cv.pdf for an unknown locale string", () => {
    expect(getCvUrl("fr")).toBe(profile.cvDownloadUrl);
  });

  it("cvDownloadUrl on profile constant is /cv.pdf", () => {
    expect(profile.cvDownloadUrl).toBe("/cv.pdf");
  });
});

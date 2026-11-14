# Job 7 — skills, certifications, education

Wave 2, waits on Job 1 (content order, ids, `SectionHeading`). Paths are relative to the repo root. Rulings: **R-A** (the tests of `SkillCategoryCard` and `CertificationCard` leave with their subjects; the AI-stack assert moves to the `SkillsSection` test), **R-M** (the `certSingular`, `certPlural`, `issuerLabel`, `viewCredential` asserts leave with their keys). The three sections stop importing `MobileCollapsibleSection` here; the unit itself goes in Job 8. Port 5107. Definition of done: `npm --prefix frontend run verify`, `npx vitest run src/components/portfolio src/lib/skillCategoryColors.test.ts`, and the PLAN §2.4 recipe on port 5107: the smoke set plus `pages/i18n-no-hardcoded.spec.ts`. Hand back the counts and the diff-read of removed or loosened asserts.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J7.T1 | sr | AC6.1 | `frontend/src/components/portfolio/SkillsSection.test.tsx` | RED: one `<dl>`, six id-keyed rows in content order; the AI-stack assert moved here (R-A) |
| J7.T2 | sr | AC6.2, AC6.3 | `frontend/src/components/portfolio/CertificationsSection.test.tsx`, `frontend/src/components/portfolio/EducationSection.test.tsx` | RED: the flat list and the one-entry education; the moved cert block loses its deleted-key asserts (R-M) |
| J7.T3 | jr | AC6.1, AC6.2 | `frontend/src/components/portfolio/SkillCategoryCard.test.tsx`, `frontend/src/components/portfolio/CertificationCard.test.tsx` | `test(J7.T3)` deletes both files with their subjects (R-A, R-M for the moved block) |
| J7.T4 | jr | AC6.1 | `frontend/src/components/portfolio/SkillsSection.tsx` | the `<dl>` |
| J7.T5 | jr | AC6.2 | `frontend/src/components/portfolio/CertificationsSection.tsx` | the flat list |
| J7.T6 | jr | AC6.3 | `frontend/src/components/portfolio/EducationSection.tsx` | one entry, no frame |
| J7.T7 | jr | AC6.1, AC6.2 | `frontend/src/components/portfolio/SkillCategoryCard.tsx`, `frontend/src/components/portfolio/CertificationCard.tsx` | deleted (their only callers went in T4 and T5) |

## Task notes

- **J7.T1.** Fixture of two or three categories with ids. Asserts: `container.querySelectorAll("dl")` has length 1; each category is a `dt` with the title and a `dd` with its items joined by ` · ` (the AI row keeps the eight names the moved assert lists, copied from `SkillCategoryCard.test.tsx`); rows follow content order; no element carries a card class. `section#habilidades` and `h2#habilidades-heading` stay.
- **J7.T2.** Certifications: a `ul` of entries in content order; each shows `<name> · <level>` and a `<issuer> · <date>` line (verbatim); a credential link only when `link` is not `#` (`target="_blank" rel="noopener noreferrer"`); no `img`, no count text, no provider heading; `section#certificacoes` and `h2#certificacoes-heading` stay. Education: degree, year (`period`), institution, coursework with its label, then the thesis link; no `location` text.
- **J7.T5.** The list key is the certification `id` (the old `key={cert.name}` collides after the rename). `PROVIDER_ICONS` and the badge images are not imported; the assets stay in the tree (SPEC §3).
- **J7.T6.** `education.location` stays in the content and the schema (published contract); only the render of it goes.

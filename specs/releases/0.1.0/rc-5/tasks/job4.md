# Job 4 — E2E: one language-switch helper that waits for the loaded locale

Wave 1, waits on nothing. Paths are relative to the repo root. Design: PLAN §2.2 (E2E helper); the structural cause is in PLAN §1 (13 copies, none waits for the loaded locale). Every file here is in the repo's `tests:` globs, so every task is a `test(J4.Tn)` commit. T1 is the RED, T2 the helper, T3 and T4 remove the copies.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J4.T1 | sr | AC5.7 | `frontend/tests/e2e/pages/language-switch.spec.ts` | RED: with the locale fetch delayed, the helper returns only after the new content shows |
| J4.T2 | sr | AC5.7 | `frontend/tests/e2e/fixtures/language.ts` | the one helper, waiting on content |
| J4.T3 | jr | AC5.7 | `frontend/tests/e2e/pages/language-switch.spec.ts`, `frontend/tests/e2e/pages/lang-persistence.spec.ts`, `frontend/tests/e2e/pages/post-strict-flip-smoke.spec.ts`, `frontend/tests/e2e/pages/cv-download-routing.spec.ts`, `frontend/tests/e2e/pages/i18n-no-hardcoded.spec.ts`, `frontend/tests/e2e/pages/ai-emphasis-content.spec.ts`, `frontend/tests/e2e/pages/role-skill-badges.spec.ts`, `frontend/tests/e2e/pages/highlight-project-block.spec.ts` | the `pages/` specs call the helper |
| J4.T4 | jr | AC5.7 | `frontend/tests/e2e/fixtures/experience-helpers.ts`, `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts`, `frontend/tests/e2e/projects-cluster/i18n-projects.spec.ts` | the fixture's copy and the projects-cluster copies go |

## Task notes

- **J4.T1.** One new case in `language-switch.spec.ts`: `page.route` holds the `/content/en.json` response for 1500 ms (the number is the case's own constant, not a measurement), then `switchLanguage(page, 'English')` is awaited from `../fixtures/language` (missing, so the case is red by the import), and the header's English nav label is read at once with `textContent()` (a read that does not wait) and equals the label in `public/content/en.json`. Against a helper that waits only on the trigger text this read sees the Portuguese label.
- **J4.T2.** `switchLanguage(page, option)`: click the first `[role="combobox"]`, click the `option` by name, wait for the `/content/<lang>.json` response of the chosen option, then expect the header nav label from `public/content/<lang>.json` to be visible. The map from option name to `<lang>` lives in the helper. It replaces the experience-helpers copy; keep the name `switchLanguage` and the `(page, optionLabel)` signature so the three specs that imported it change only their import line.
- **J4.T3, J4.T4.** Replace each copy and each inline block (the list in PLAN §1) by a call; delete the local functions; the three specs that imported from `experience-helpers` import from `../fixtures/language`. `layout-shell.spec.ts:134` keeps its title assertion; its `titlePT2` read (a one-shot read before the switch) stays as is. No assert is removed or loosened; the removed lines are only the open-click-wait mechanics.

## Definition of done

`npm --prefix frontend run verify` exits 0. E2E, with the PLAN §2.3 recipe (port 5302): `language-switch`, `lang-persistence`, `post-strict-flip-smoke`, `cv-download-routing`, `i18n-no-hardcoded`, `ai-emphasis-content`, `role-skill-badges`, `highlight-project-block`, `layout-shell`, `i18n-projects`, each green on chromium; the J4.T1 case red before J4.T2 and green after. Grep, cited with its count: `grep -rn 'role="combobox"' frontend/tests/e2e` prints only `fixtures/language.ts`.

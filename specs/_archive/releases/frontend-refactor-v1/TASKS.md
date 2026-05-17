# Release TASKS — frontend-refactor-v1 (archived)

**Status:** Aprovado

- [x] T-FE-01 — Podagem shadcn + remoção de dependências órfãs. Removeu 37 componentes
  ui/ + 30+ deps npm. Ganho de bundle >= 180KB gz.
- [x] T-FE-02 — `useContent()` + `LanguageProvider` (DIP). Único ponto de carga de
  conteúdo. Fallback determinístico: chave faltante em `de` -> `en`.
- [x] T-FE-03 — Refactor `Header.tsx`: decomposição em `HeaderShell`,
  `HeaderDesktopLayout`, `HeaderMobileLayout`, `LanguageSelector`, `ContactStrip`,
  `EmailModal`, `AvatarImageModal`.
- [x] T-FE-04 — Refactor `Portfolio.tsx`: decomposição em 12 componentes
  (HeroSection, ExperienceSection, ExperienceCard, RoleCollapsible, EducationSection,
  CertificationsSection, CertificationCategoryGroup, CertificationCard, SkillsSection,
  SkillCategoryCard, MobileCollapsibleSection, Portfolio orquestrador).
- [x] T-FE-05 — Modais inline do Header substituídos por Radix Dialog (`dialog.tsx`)
  com focus trap, ESC handler e ARIA labels.
- [x] T-FE-06 — URLs sociais centralizadas em `frontend/src/data/profile.ts`. Defaults
  fake (`https://linkedin.com`, `https://github.com`) eliminados.
- [x] T-FE-07 — Landmarks ARIA aplicados: `aria-labelledby` em sections, `<nav
  aria-label>`, `aria-current="location"` em itens de navegação.
- [x] T-FE-08 — Tabela `frontend/src/routes.ts` centralizada (consumida pelo
  Header e por `App.tsx`).
- [x] T-FE-09 — `ProjectTabPage` extraído como layout genérico para abas de projeto
  (consumido inicialmente por `DadaiaWorkspacePage`).
- [x] T-FE-10 — Housekeeping: removeu `App.css`, `.flask.pid`, scripts vazios,
  `AGENTS.md` legado, `z_prompts.md`, README links quebrados corrigidos.

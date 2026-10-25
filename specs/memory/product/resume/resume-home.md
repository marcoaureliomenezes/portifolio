---
slug: resume-home
title: Resume home
tldr: The home is a frameless resume - hero, experience, two projects, skills, certifications, education - every number and word read from content.
summary: Portfolio renders Hero, Experience, Projects, Skills, Certifications and Education in one column with no section card or fold; the hero's stat line is derived from content, role periods are localized by one parser, and the only disclosures are the story toggle and each role's Details control.
tags:
  - resume
  - home
  - i18n
sources:
  - frontend/src/components/portfolio/*
  - frontend/src/components/projects/ProjectCard.tsx
  - frontend/src/components/projects/__tests__/ProjectCard.test.tsx
  - frontend/src/components/ui/disclosure.tsx
  - frontend/src/lib/formatPeriod.ts
  - frontend/src/lib/formatPeriod.test.ts
  - frontend/src/lib/resumeContent.test.ts
  - frontend/src/lib/homeParity.test.ts
  - frontend/src/assets/profile.webp
  - frontend/public/content/*.json
  - frontend/tests/e2e/fixtures/experience-helpers.ts
  - frontend/tests/e2e/pages/home.spec.ts
  - frontend/tests/e2e/pages/role-collapsible.spec.ts
---

## What it does

At `/` a visitor reads the owner's resume top to bottom in the chosen language: who he is, where
he worked, two projects, what he works with, what he is certified in and where he studied.

## Current behavior

- `Portfolio` renders, in this order: Hero, Experience (`#experiencia`), Projects
  (`#projetos-destaque`), Skills (`#habilidades`), Certifications (`#certificacoes`), Education
  (`#educacao`), 56 px apart (80 px from `md`). No section sits in a card or a fold; every
  section title is a `SectionHeading` (`h2`, label step, uppercase, muted).
- Hero, one column: avatar, the mono name and location line, the `h1#hero-heading` tagline, the
  stat line, `resume.short`, then the story toggle (`storyOpen` / `storyClose`, `aria-expanded`)
  that shows `resume.full` beneath it. Download CV (`profile.cvUrl`) and the LinkedIn, GitHub and
  Instagram links from `profile` stay visible whatever the toggle's state. The hero has one CTA.
- The stat line reads `<n>+ <years> · <m> <certs> · <clouds>`: n is the whole years since the
  earliest start among the `main` experiences, m the length of the certification list, the
  clouds the `cloud-providers` skill row joined by " · "; the two words come from
  `heroStatsSuffix`. No number in it is typed in content.
- Experience: each `main` employer is one `h3` line (name, period, location) under a left rule,
  its roles beneath. A role is a frameless `article`: title, period, its first responsibility as
  an unclamped summary capped at 680 px, and one inline Details control (`detailsOpen` /
  `detailsClose`, closed at first, tracking `section_expand` and `section_collapse`). It reveals
  the remaining responsibilities, the technologies, the skill badges and the highlight project,
  whose impact badge text and accessible name are the locale's `impactLabel`.
- After the employers, one Earlier line under `earlierLabel` lists each `minor` experience in
  content order as `<title>, <company> (<year range>)`, joined by " · ".
- `lib/formatPeriod.ts` is the one period parser. `formatPeriod` renders
  `<start> – <end> · <duration>` with months and years from `Intl.DateTimeFormat` and duration
  units from `Intl.NumberFormat` in the visitor's locale; a trailing "(…)" suffix is dropped and
  the duration recomputed; an open end shows the source's own word ("Presente", "Present",
  "Heute"); an unparsable period renders as written. `yearRange` gives the Earlier line's
  `2015–18` form, and `yearsSince` the stat line's n.
- Projects: rand-engine then dadaia-workspace, two per row from `md`, one below; the heading
  ends with the `seeAllProjects` link to `/projetos` (`data-testid="see-all-projects"`).
- `ProjectCard`, the one card of the home and `/projetos`, is a single link to the project page
  with four elements: the hero media's desktop poster (`<img>` with width, height and alt; the
  card cover or a gradient placeholder when the item has no video), the name, the one-line
  purpose and, for a library item, `PyPI <version>`. The home renders no `<video>`.
- Skills: one `<dl>`, a `<dt>` per category keyed by its `id` and its items in one `<dd>`
  joined by " · ", in content order.
- Certifications: one flat list in content order (newest first by `priority`); each entry is
  `<name> · <level>`, the name linked to the credential unless `link` is `#`, over a mono
  `<issuer> · <date>` line.
- Education: one entry, no frame: degree and period, institution, coursework, then the thesis,
  linked when `thesisLink` is set.

## Boundaries

- The header, footer and the 960 px column around the home: [[site-chrome]]. The keys it reads
  and their locale parity: [[content-contract]]. The project pages a card opens:
  [[rand-engine-page]], [[dadaia-workspace-page]].
- No blog, no story route and no video on the home.

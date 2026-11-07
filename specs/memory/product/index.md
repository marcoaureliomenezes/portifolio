---
slug: index
title: Product catalog
tldr: Index of every product feature with summaries and context metadata.
summary: Consolidated view of every product feature. Entry point for self-pulling a specific feature atom. Maintained by dd-product-engineer at each release CLOSURE.
tags:
  - catalog
  - product
  - index
---

## Atomic view

The product vision is not documented yet. Describe the project's core purpose here.

## Users

| User | Description |
|------|-------------|
| placeholder | Users not documented yet. Describe who uses the product and how. |

## Feature catalog

### blog

| slug | title | tldr |
|------|-------|------|
| `blog` | Blog | Markdown post folders become per-post HTML, an index and an RSS feed at build time; project heads are prerendered; the Blog link shows once a post is published. |

### content

| slug | title | tldr |
|------|-------|------|
| `content-contract` | Content contract | projects.ts is the one project schema, links are http(s), v1.json its input-mode export; verify parses the locales, checks key parity and every asset. |

### infra

| slug | title | tldr |
|------|-------|------|
| `deploy-infrastructure` | Deploy infrastructure | One Terraform module serves the site from private S3 via CloudFront per env; Actions deploys over OIDC, hashed assets immutable, the rest no-cache. |

### legacy

| slug | title | tldr |
|------|-------|------|
| `legacy-specs` | Legacy specs | specs-bkp/ is the pre-canon specs tree kept by specs init; it is reading material only, unread by the site and its gates. |

### media

| slug | title | tldr |
|------|-------|------|
| `scene-media` | Scene media pipeline and player | Scenes recorded from a pinned PyPI version, hash-named under byte budgets, played muted and looped, a still under reduced motion. |

### projects

| slug | title | tldr |
|------|-------|------|
| `dadaia-workspace-page` | dadaia-workspace project page | The library page for dadaia-workspace, pinned to PyPI 0.4.7 and tag v0.4.7, with a hero loop, three scenes, a pinned Try it and facts from the tag. |
| `library-page` | Library project page layout | The one library page layout - purpose, install line, hero loop, side-by-side scenes, Try it, Why it exists, facts pinned to a tag. |
| `rand-engine-page` | rand-engine project page | The library page for rand-engine, pinned to PyPI 0.8.0 and tag 0.8.0, with a hero loop, three scenes, a runnable Try it and facts from the tag. |

### quality

| slug | title | tldr |
|------|-------|------|
| `e2e-suite` | End-to-end suite | Playwright runs nine smoke specs on every PR and the full suite weekly, against a local server on port 8080 with the pt-BR locale. |

### resume

| slug | title | tldr |
|------|-------|------|
| `resume-home` | Resume home | The home is a frameless resume - hero, experience, two projects, skills, certifications, education - numbers derived from content, labels from the locale. |

### site

| slug | title | tldr |
|------|-------|------|
| `analytics-sdk` | Analytics SDK | A vendored dependency-free SDK queues anonymous events per tab session and sends them by sendBeacon when the page hides. |
| `site-chrome` | Shared site chrome | One header and one footer on every route, one 960 px column with 680 px prose, one type scale, localized chrome strings and <html lang>. |

## Capability map

```mermaid
graph TD
  A[No data]
```

## Known limits

Limits not documented yet.

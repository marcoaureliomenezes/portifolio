# Backlog — platform-observability-admin-v1

**Registered:** 2026-05-22
**Operator:** Marco Aurelio Menezes
**Status:** Parked — awaiting fresh session + specialist team kickoff

---

## Scope

Two platform-level features, designed to be **reusable across all future sites**
(portifolio, burrinho's barbe, gisele psicóloga, and beyond).
Both features must be built as a **central shared service** (multi-tenant),
not per-site copies.

---

## Feature 1 — Engagement Analytics (`analytics-platform-v1`)

### What
Custom event tracking system that captures every meaningful interaction on every
site and delivers raw event data to S3 for downstream processing in the data platform.

### Events to capture (portifolio baseline)
- Curriculum (CV) download click
- Section expand / collapse (Experience, Education, Certifications, Skills)
- Certification credential link click
- Thesis link click
- Project CTA clicks
- Language switcher toggle
- Theme toggle
- Page view + referrer + UTM params

### Architecture decisions (already made by operator)
| Decision | Choice |
|---|---|
| Tracking approach | Custom — no third-party SDK |
| Destination | AWS S3 bucket (Parquet or newline-delimited JSON) |
| Reuse model | Central shared service (multi-tenant) |

### Architecture decisions (open — for software-architect + backend-engineer)
| Decision | Options to evaluate |
|---|---|
| Ingest endpoint | API Gateway + Lambda vs CloudFront Function vs self-hosted FastAPI |
| S3 partitioning | `site_id / year / month / day / hour / event_type` |
| Event schema | Must include: `event_id`, `site_id`, `session_id`, `event_type`, `path`, `ts`, `metadata{}` |
| Batching strategy | Browser-side batching (sendBeacon on unload) vs fire-and-forget per event |
| PII / LGPD compliance | No PII in events; IP anonymization; cookie consent banner requirement |
| DDOS / abuse protection | Rate limiting at ingest layer; CloudFront WAF rules |

### Security concerns (for security-reviewer)
- Ingest endpoint is public — must be rate-limited and authenticated via `site_id` + shared secret
- No PII storage (LGPD/GDPR)
- S3 bucket: private, no public access, encryption at rest
- Investigate current site exposure: CloudFront + WAF gaps, missing security headers

### Deliverable
Raw event files in S3, partitioned and queryable by the data platform (Databricks / Athena).
Dashboard design and pipeline are **out of scope** for this feature — handled separately.

---

## Feature 2 — Admin Management Console (`admin-console-v1`)

### What
Secure web admin panel where site owners (and operator) can edit site content
without triggering a deploy. Changes are reflected on the live site in real-time
(or near-real-time).

### Capabilities (portifolio baseline)
- Add / edit / remove certifications
- Edit bio text, tagline, stats
- Replace profile photo
- Toggle dark/light theme as site-wide default
- Add / edit experience entries
- Add / edit education entry
- Publish / unpublish changes (draft → live)

### Architecture decisions (already made by operator)
| Decision | Choice |
|---|---|
| Content storage | Database — Postgres or DynamoDB (to be decided by architect) |
| Reuse model | Central shared service (multi-tenant) — one backend, N sites as tenants |
| Auth model | Multi-tenant: each site has its own admin; operator has master access |

### Architecture decisions (open — for software-architect + backend-engineer)
| Decision | Options to evaluate |
|---|---|
| Database | Postgres (RDS/Aurora Serverless v2) vs DynamoDB — architect to weigh cost, flexibility, schema evolution |
| Content versioning | Optimistic locking + version history table; rollback to any previous version |
| Frontend read model | Site fetches content from API at runtime vs SSG with ISR (revalidation on publish) |
| Admin UI | Separate React app (admin.marcomenezes.dev) vs embedded route (/admin) behind auth guard |
| Auth implementation | Multi-tenant user table + TOTP (2FA) for all accounts; operator has cross-tenant master role |
| Media storage | S3 bucket for images (profile photo, cert badges); CDN in front |
| Audit log | Every edit logged with user, timestamp, diff — for security and rollback |

### Security concerns (for security-reviewer)
- Admin routes must be completely separated from public routes (no shared Lambda/process)
- Brute-force protection on login (lockout after N failures + CAPTCHA)
- 2FA mandatory for all admin accounts
- CSRF protection on all mutating API endpoints
- Content sanitization before DB write (no XSS via stored content)
- Rate limiting and IP allowlist option for admin login endpoint
- Session expiry + revocation on logout

---

## Feature 3 — Security Audit (`security-audit-v1`)

### What
Before building the above, the site needs a security baseline assessment.

### Scope
- Current CloudFront + origin server exposure (DDOS surface)
- Missing HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- Dependency CVEs (npm audit)
- Infrastructure IaC review (Terraform config)
- LGPD compliance gap analysis

### Owner: security-reviewer + devops-engineer

---

## Agents Required

| Agent | Role |
|---|---|
| `software-architect` | Design ADR for central service architecture; DB choice; tenant model |
| `backend-engineer` | Ingest API, content API, admin auth service (Go or Python) |
| `frontend-engineer` | Event tracking SDK (browser), admin UI components |
| `devops-engineer` | S3 bucket, API Gateway/Lambda, WAF, CloudFront, CI/CD for new service |
| `security-reviewer` | Security audit (Feature 3); auth design review; LGPD gap |
| `qa-engineer` | E2E test plan for admin CRUD + event delivery verification |
| `product-engineer` | SPEC/PLAN/TASKS authoring for each sub-release |
| `project-manager` | Orchestration; dadaia-grill-me to align on DB choice and tenant model |

---

## Suggested Release Decomposition

```
platform-observability-admin-v1/
  security-audit-v1        ← prerequisite; unblocks architecture decisions
  analytics-platform-v1    ← ingest + S3 delivery (no dashboard)
  admin-console-v1         ← content API + admin UI (portifolio as pilot tenant)
  admin-console-v2         ← onboard burrinho's barbe + gisele psicóloga as tenants
```

## Activation Trigger

Operator opens a fresh session and runs `dadaia-grill-me` with `project-manager`
to align the team on open decisions (DB choice, ingest endpoint, admin UI placement)
before `product-engineer` authors the SPEC.

## Open Questions for dadaia-grill-me

1. **DB choice**: Postgres (Aurora Serverless v2) vs DynamoDB for content storage —
   cost at low traffic vs schema flexibility vs operator familiarity?
2. **Ingest endpoint**: Lambda (serverless, zero maintenance) vs FastAPI on ECS
   (more control, reuses Python expertise) vs CloudFront Function (ultra-low latency)?
3. **Admin UI placement**: Separate subdomain (admin.marcomenezes.dev) vs
   embedded route (/admin) with auth guard — security vs operational simplicity?
4. **Content read model**: Does the site call the content API on every page load
   (dynamic) or does admin publish trigger a rebuild/cache invalidation (hybrid)?
5. **LGPD cookie consent**: Required before firing any tracking events — scope this
   into analytics-platform-v1 or as a separate prerequisite?
6. **Burrinho and Gisele sites**: Are they also React/TypeScript (same stack as
   portifolio) or different? This affects how the admin UI SDK is built.

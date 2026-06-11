---
name: fe-qual-refactor-salvage
status: Candidate
created: 2026-06-11
origin: projects-cluster-v2 rc-2 fold (ADR-PC2-R2-05)
---

# Salvage evaluation — feature/fe-qual-refactor

The branch `feature/fe-qual-refactor` (origin, head `2c6d52c`) holds **17 commits
not merged into develop** (72 vs main), including:

- T-FE-QUAL-06: i18n de-hardcoding (~28 strings movidas para content JSON)
- QUAL-05: guard de body vazio em seções de diagrama
- fix de layout `md:pl-60` (sidebar clipping — possivelmente obsoleto: o sidebar
  é dead code removido no rc-2)

The local worktree `.worktrees/fe-qual-refactor` was removed in the rc-2 hygiene
purge (branch preserved on origin — zero loss).

**Task:** rebase the branch onto post-rc-2 main, drop commits superseded by the
rc-2 `DiagramCard`/i18n work and the sidebar removal, and decide merge/abandon
per surviving commit. Conflicts are expected on content JSONs and templates.

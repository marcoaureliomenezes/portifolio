/**
 * LibraryProjectTemplate — T-PC2-R2-04 (ADR-PC2-R2-01)
 *
 * Renders an open-source library project page (rand-engine, dadaia-workspace).
 * Accepts only `LibraryProject` (narrow type); discrimination upstream in
 * `ProjectDetailPage`.
 *
 * Layout: hero → install block (pip snippet + version + headline stat) →
 *         architecture diagram → body sections → links (GitHub + PyPI [+ docs])
 *
 * The install block is the signature element of this kind: a copy-friendly
 * `pip install <package>` snippet that makes the "published Python library"
 * signal land in seconds (SPEC §2 — recruiter persona).
 *
 * SEO: managed via `useDocumentSeo` — no imperative useEffect allowed (AC-PC-11).
 */

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/hooks/useContent";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSections } from "@/components/projects/ProjectSections";
import { DiagramCard } from "@/components/projects/DiagramCard";
import { track } from "@dadaia/analytics-sdk";
import type { LibraryProject } from "@/types/content";

export function LibraryProjectTemplate({ project }: { project: LibraryProject }) {
  useDocumentSeo({
    title: project.seo.title,
    description: project.seo.description,
  });

  const { content } = useContent();
  const { slug, pypi, stat, links } = project;
  const archLabels = content.archPage;
  const libLabels = content.libraryPage;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pypi.installCommand);
      setCopied(true);
      track("project_cta", { project: slug, action: "copy_install" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — silently skip.
    }
  };

  return (
    <main
      className="container mx-auto px-4 pt-36 md:pt-32 pb-12 space-y-10 max-w-4xl"
      aria-label={project.seo.title}
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <ProjectHero project={project} />

      {/* ── Install block ────────────────────────────────────────── */}
      <section aria-labelledby={`${slug}-install-heading`}>
        <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle
              id={`${slug}-install-heading`}
              className="text-lg md:text-2xl font-bold text-foreground"
            >
              {libLabels?.installTitle ?? "Instalação"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="library-version">
                {libLabels?.versionLabel ?? "versão"} {pypi.version}
              </Badge>
              {stat && (
                <Badge variant="outline" data-testid="library-stat">
                  {stat.value} {stat.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
              <code
                data-testid="install-command"
                className="flex-1 font-mono text-sm text-foreground overflow-x-auto whitespace-nowrap"
              >
                {pypi.installCommand}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                aria-label={libLabels?.copyLabel ?? "Copiar comando"}
                data-testid="copy-install"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only md:not-sr-only md:ml-1">
                      {libLabels?.copiedLabel ?? "Copiado"}
                    </span>
                  </>
                ) : (
                  <Copy className="w-4 h-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Architecture diagram (shared, i18n, theme-aware) ─────── */}
      <DiagramCard project={project} />

      {/* ── Body sections ────────────────────────────────────────── */}
      <ProjectSections sections={project.sections} slug={slug} />

      {/* ── Links ────────────────────────────────────────────────── */}
      <section aria-labelledby={`${slug}-links-heading`}>
        <Card className="w-full shadow-medium border-0 bg-card">
          <CardHeader className="pb-2">
            <CardTitle
              id={`${slug}-links-heading`}
              className="text-lg font-bold text-foreground"
            >
              {archLabels?.linksTitle ?? "Links"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild variant="default">
              <a
                href={links.pypi}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                onClick={() => track("project_cta", { project: slug, action: "pypi" })}
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                {libLabels?.linkPypi ?? "PyPI"}
              </a>
            </Button>
            <Button asChild variant="outline">
              <a
                href={links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                onClick={() => track("project_cta", { project: slug, action: "github" })}
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                {archLabels?.linkGithubRepo ?? "GitHub Repository"}
              </a>
            </Button>
            {links.docs && (
              <Button asChild variant="outline">
                <a
                  href={links.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  Docs
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

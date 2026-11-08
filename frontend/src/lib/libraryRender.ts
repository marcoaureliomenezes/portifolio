/**
 * libraryRender.ts — fills the `{version}` and `{tag}` placeholders of a library project.
 *
 * `renderLibrary(project)` returns the project with `pypi.installCommand`, every section
 * `code` and every item `href` substituted; `{tag}` is `pypi.tagPrefix` (empty when absent)
 * plus `pypi.version`. Pure; the input is not mutated.
 */

import type { LibraryProject } from "@/types/content";

export function renderLibrary(project: LibraryProject): LibraryProject {
  const { version, tagPrefix = "" } = project.pypi;
  const fill = (s: string) => s.replaceAll("{version}", version).replaceAll("{tag}", tagPrefix + version);
  return {
    ...project,
    pypi: { ...project.pypi, installCommand: fill(project.pypi.installCommand) },
    sections: project.sections.map((s) => ({
      ...s,
      ...(s.code !== undefined && { code: fill(s.code) }),
      ...(s.items && { items: s.items.map((i) => (i.href ? { ...i, href: fill(i.href) } : i)) }),
    })),
  };
}

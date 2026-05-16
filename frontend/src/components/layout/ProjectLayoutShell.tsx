/**
 * ProjectLayoutShell — T-FE-QUAL-04
 *
 * Shared layout wrapper for all `/projetos/*` routes.
 * Provides:
 *  - HeaderShell (fixed top header with language switcher, theme toggle, avatar)
 *  - A back-link to "/" with i18n label and accessible aria-label
 *  - An <Outlet /> that renders the matched child route's page component
 *
 * Usage (in App.tsx):
 *   <Route element={<ProjectLayoutShell />}>
 *     <Route path="/projetos/dadaia-workspace" element={<DadaiaWorkspacePage />} />
 *     ...
 *   </Route>
 */

import { Outlet, Link } from "react-router-dom";
import { HeaderShell } from "@/components/header/HeaderShell";
import { useContent } from "@/hooks/useContent";

export default function ProjectLayoutShell() {
  const { content } = useContent();
  const backLabel = content.nav?.backToHome ?? "Back to Home";

  return (
    <>
      <HeaderShell />
      {/* pt-32 clears the fixed header (~128px); max-w-5xl centres content */}
      <div className="pt-32 px-4 max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          aria-label={backLabel}
        >
          ← {backLabel}
        </Link>
        <Outlet />
      </div>
    </>
  );
}

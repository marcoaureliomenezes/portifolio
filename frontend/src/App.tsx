import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import ProjectLayoutShell from "./components/layout/ProjectLayoutShell";

// Lazy chunks — keep home (LCP route) eager; defer everything else.
const NotFound = lazy(() => import("./pages/NotFound"));
const DadaiaWorkspacePage = lazy(() =>
  import("./pages/projects/DadaiaWorkspacePage").then((m) => ({
    default: m.DadaiaWorkspacePage,
  })),
);
const TauanGamesPage = lazy(() =>
  import("./pages/projects/TauanGamesPage").then((m) => ({
    default: m.TauanGamesPage,
  })),
);
const ArchitecturePage = lazy(() =>
  import("./pages/projects/ArchitecturePage").then((m) => ({
    default: m.ArchitecturePage,
  })),
);

/**
 * App — T-FE-QUAL-04
 *
 * Route structure:
 *   /                           → Index (home, has its own HeaderShell)
 *   /projetos/*                 → ProjectLayoutShell (shared header + back-link)
 *     /projetos/dadaia-workspace → DadaiaWorkspacePage
 *     /projetos/tauan-games      → TauanGamesPage
 *     /projetos/portifolio       → ArchitecturePage
 *   *                           → NotFound
 */
const App = () => (
  <LanguageProvider>
    <TooltipProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            {/* Home — eager, has its own full-page layout */}
            <Route path="/" element={<Index />} />

            {/* Project pages — share ProjectLayoutShell (header + back-link) */}
            <Route element={<ProjectLayoutShell />}>
              <Route
                path="/projetos/dadaia-workspace"
                element={<DadaiaWorkspacePage />}
              />
              <Route
                path="/projetos/tauan-games"
                element={<TauanGamesPage />}
              />
              <Route
                path="/projetos/portifolio"
                element={<ArchitecturePage />}
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </LanguageProvider>
);

export default App;

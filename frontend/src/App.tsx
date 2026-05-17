import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProjectsLayoutShell } from "@/components/projects/ProjectsLayoutShell";
import Index from "./pages/Index";

// Lazy chunks — keep home (LCP route) eager; defer everything else.
const NotFound = lazy(() => import("./pages/NotFound"));

// T-PC-B-05: ProjectDetailPage replaces the 3 static legacy routes.
// The componentMap is removed; dispatch is now handled inside ProjectDetailPage
// via switch(project.kind) + assertNever.
const ProjectDetailPage = lazy(() =>
  import("./pages/projects/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  })),
);

// T-PC-B-05 / T-PC-B-09: /projetos index stub — TODO T-PC-C-03 (ProjectsIndexPage).
// ProjectsIndexPage does not exist yet (Phase C). The stub lives inside the
// ProjectsLayoutShell layout route so the breadcrumb chrome is already applied.
// Will be replaced by the real ProjectsIndexPage in T-PC-C-03.
function ProjectsIndexPlaceholder() {
  return (
    <main className="container mx-auto px-4 pb-12 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-primary">Projetos</h1>
      <p className="text-muted-foreground">
        {/* TODO T-PC-C-03: replace with ProjectsIndexPage */}
        Em breve &mdash; galeria de projetos.
      </p>
    </main>
  );
}

const App = () => (
  <LanguageProvider>
    <TooltipProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Index />} />

            {/* Projects cluster — T-PC-B-09: nested layout route wraps /projetos/* */}
            {/* ProjectsLayoutShell renders breadcrumb + back-link + <Outlet /> */}
            <Route element={<ProjectsLayoutShell />}>
              {/* Index stub: will be replaced by ProjectsIndexPage in T-PC-C-03 */}
              <Route path="/projetos" element={<ProjectsIndexPlaceholder />} />
              {/* Dynamic detail: dispatches to CaseStudy | Meta | Games template */}
              <Route path="/projetos/:slug" element={<ProjectDetailPage />} />
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

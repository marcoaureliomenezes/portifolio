import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

// T-PC-B-05: /projetos index stub — TODO T-PC-C-03 (ProjectsIndexPage).
// ProjectsIndexPage does not exist yet (Phase C). Registering the route now
// so that /projetos/:slug works without 404, and the index URL resolves to a
// minimal in-tree placeholder rather than the catch-all NotFound. The stub
// will be replaced in T-PC-C-03 when Phase C lands.
function ProjectsIndexPlaceholder() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4 px-6">
        <h1 className="text-3xl font-bold text-primary">Projetos</h1>
        <p className="text-muted-foreground">
          {/* TODO T-PC-C-03: replace with ProjectsIndexPage */}
          Em breve &mdash; galeria de projetos.
        </p>
      </div>
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

            {/* Projects cluster — Phase B routes (T-PC-B-05) */}
            {/* Index stub: will be replaced by ProjectsIndexPage in T-PC-C-03 */}
            <Route path="/projetos" element={<ProjectsIndexPlaceholder />} />
            {/* Dynamic detail: dispatches to CaseStudy | Meta | Games template */}
            <Route path="/projetos/:slug" element={<ProjectDetailPage />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </LanguageProvider>
);

export default App;

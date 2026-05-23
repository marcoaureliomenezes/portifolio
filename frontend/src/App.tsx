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

// T-PC-C-03: ProjectsIndexPage replaces the inline ProjectsIndexPlaceholder.
// Lazy-loaded as a separate chunk — home (LCP route) stays eager.
const ProjectsIndexPage = lazy(() =>
  import("./pages/projects/ProjectsIndexPage").then((m) => ({
    default: m.ProjectsIndexPage,
  })),
);

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
              {/* T-PC-C-03: ProjectsIndexPage (lazy chunk) */}
              <Route path="/projetos" element={<ProjectsIndexPage />} />
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

import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import { routes } from "./routes";

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
const ProjectsIndexPage = lazy(() =>
  import("./pages/projects/ProjectsIndexPage").then((m) => ({
    default: m.ProjectsIndexPage,
  })),
);

const componentMap: Record<string, React.ReactElement> = {
  home: <Index />,
  "not-found": <NotFound />,
  "projects-index": <ProjectsIndexPage />,
  "dadaia-workspace": <DadaiaWorkspacePage />,
  "tauan-games": <TauanGamesPage />,
  portifolio: <ArchitecturePage />,
};

const App = () => (
  <LanguageProvider>
    <TooltipProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.slug}
                path={route.path}
                element={componentMap[route.slug] ?? <NotFound />}
              />
            ))}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </LanguageProvider>
);

export default App;

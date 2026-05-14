import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { DadaiaWorkspacePage } from "./pages/projects/DadaiaWorkspacePage";
import { TauanGamesPage } from "./pages/projects/TauanGamesPage";
import { ArchitecturePage } from "./pages/projects/ArchitecturePage";
import { routes } from "./routes";

// Component map: slug → React element
// T-CONTENT-02/03/04: project tab pages wired up
const componentMap: Record<string, React.ReactElement> = {
  home: <Index />,
  "not-found": <NotFound />,
  "dadaia-workspace": <DadaiaWorkspacePage />,
  "tauan-games": <TauanGamesPage />,
  portifolio: <ArchitecturePage />,
};

const App = () => (
  <LanguageProvider>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.slug}
              path={route.path}
              element={componentMap[route.slug] ?? <NotFound />}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </LanguageProvider>
);

export default App;

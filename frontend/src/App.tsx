import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { routes } from "./routes";

// Component map: slug → React element
// Stub routes (future project tabs) fall through to NotFound until T-FE-09 / T-CONTENT-*
const componentMap: Record<string, React.ReactElement> = {
  home: <Index />,
  "not-found": <NotFound />,
};

const App = () => (
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
);

export default App;

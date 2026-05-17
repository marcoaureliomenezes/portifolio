import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useContent } from "@/hooks/useContent";

const NotFound = () => {
  const location = useLocation();
  const { content } = useContent();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4 px-6">
        <h1 className="text-5xl md:text-6xl font-bold">404</h1>
        <p className="text-lg md:text-xl text-foreground/80">{content.notFoundMessage}</p>
        <a
          href="/"
          className="inline-block underline font-medium text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        >
          {content.returnHome}
        </a>
      </div>
    </main>
  );
};

export default NotFound;

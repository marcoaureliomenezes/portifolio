import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";

/** Layout route: the one header, then `<main id="main-content">` offset by `--header-h`. */
export function SiteLayout() {
  return (
    <div className="min-h-screen bg-background w-full">
      <Header />
      <main id="main-content" className="flex-1" style={{ paddingTop: "var(--header-h)" }}>
        <Outlet />
      </main>
    </div>
  );
}

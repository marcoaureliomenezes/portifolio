import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { useContent } from "@/hooks/useContent";
import { COLUMN } from "@/lib/layout";

/** Layout route: the one header, `<main id="main-content">` offset by `--header-h` holding the outlet in the site column, then the footer. */
export function SiteLayout() {
  const { content } = useContent();
  const { profile } = content;
  // The context stub (no provider) carries no chrome; the app never renders without one.
  const footer = content.siteChrome?.footer;
  const link = "underline-offset-4 hover:underline";

  return (
    <div className="min-h-screen bg-background w-full">
      <Header />
      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "var(--header-h)" }}
      >
        <div className={COLUMN}>
          <Outlet />
        </div>
      </main>
      {footer && profile && (
        <footer
          aria-label={footer.label}
          className="border-t border-border py-8 text-sm text-muted-foreground"
        >
          <div
            className={`${COLUMN} flex flex-wrap items-center justify-between gap-4`}
          >
            <p>
              © {new Date().getFullYear()} {footer.owner}
            </p>
            <nav className="flex gap-4">
              <a className={link} href={`mailto:${profile.email}`}>
                {footer.email}
              </a>
              <a
                className={link}
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {footer.linkedin}
              </a>
              <a
                className={link}
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {footer.github}
              </a>
            </nav>
          </div>
        </footer>
      )}
    </div>
  );
}

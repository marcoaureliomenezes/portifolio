/**
 * Backward-compatible re-export of the new Portfolio orchestrator.
 *
 * The `language` prop is accepted but ignored — the component now consumes
 * language via useContent() / LanguageContext.  Callers may continue passing
 * `language` without a TypeScript error; it will be removed in T-FE-04 cleanup.
 */
export { Portfolio } from "@/components/portfolio/Portfolio";

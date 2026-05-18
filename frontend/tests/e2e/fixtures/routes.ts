/**
 * Canonical route constants for E2E tests.
 * Keep in sync with frontend/src/routes.ts.
 */
export const ROUTES = {
  home: "/",
  projectsIndex: "/projetos",
  dadaiaWorkspace: "/projetos/dadaia-workspace",
  tauanGames: "/projetos/tauan-games",
  portifolio: "/projetos/portifolio",
  projectsNotFound: "/projetos/does-not-exist",
  notFound: "/rota-inexistente",
} as const;

export type RouteKey = keyof typeof ROUTES;

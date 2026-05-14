export interface Route {
  slug: string;
  path: string;
  labelKey: string;
  /** Whether this route appears in the sidebar nav */
  inNav: boolean;
}

export const routes: Route[] = [
  {
    slug: "home",
    path: "/",
    labelKey: "nav.home",
    inNav: false,
  },
  // Future project tabs (stubs — components come in T-FE-09 / T-CONTENT-*)
  {
    slug: "dadaia-workspace",
    path: "/projetos/dadaia-workspace",
    labelKey: "nav.dadaiaWorkspace",
    inNav: true,
  },
  {
    slug: "tauan-games",
    path: "/projetos/tauan-games",
    labelKey: "nav.tauanGames",
    inNav: true,
  },
  {
    slug: "portifolio",
    path: "/projetos/portifolio",
    labelKey: "nav.portifolio",
    inNav: true,
  },
  {
    slug: "not-found",
    path: "*",
    labelKey: "nav.notFound",
    inNav: false,
  },
];

export const navRoutes = routes.filter((r) => r.inNav);

export interface Route {
  slug: string;
  path: string;
  labelKey: string;
  /** Whether this route appears in the header nav */
  inHeaderNav: boolean;
}

export const routes: Route[] = [
  {
    slug: "home",
    path: "/",
    labelKey: "nav.home",
    inHeaderNav: false,
  },
  {
    slug: "projects-index",
    path: "/projetos",
    labelKey: "nav.projects",
    inHeaderNav: true,
  },
  {
    slug: "project-detail",
    path: "/projetos/:slug",
    labelKey: "nav.projectDetail",
    inHeaderNav: false,
  },
  {
    slug: "not-found",
    path: "*",
    labelKey: "nav.notFound",
    inHeaderNav: false,
  },
];

export const headerNavRoutes = routes.filter((r) => r.inHeaderNav);

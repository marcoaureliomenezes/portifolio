import { useEffect } from "react";

interface DocumentSeoParams {
  title: string;
  description: string;
}

/**
 * useDocumentSeo — T-PC-B-02
 *
 * Sets document.title and meta tags (description, og:title, og:description)
 * for the current route. Designed to be called from kind-specific templates
 * (CaseStudyTemplate, MetaProjectTemplate, GamesProjectTemplate), NOT from
 * the layout shell (per QA contract C-06).
 *
 * SSR-safe: all DOM access is guarded behind typeof document checks inside
 * the useEffect, which never runs in a server environment.
 *
 * Cleanup: restores the previous document.title on unmount. Meta tags are
 * left in place on unmount (they will be overwritten by the next page's call).
 */
export function useDocumentSeo({ title, description }: DocumentSeoParams): void {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousTitle = document.title;
    document.title = title;

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);

    return () => {
      if (typeof document === "undefined") return;
      document.title = previousTitle;
    };
  }, [title, description]);
}

/**
 * Sets a <meta> tag by attribute + value.
 * Updates the tag content if it already exists; creates it if absent.
 */
function setMeta(
  attr: "name" | "property",
  value: string,
  content: string,
): void {
  const selector = `meta[${attr}="${value}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

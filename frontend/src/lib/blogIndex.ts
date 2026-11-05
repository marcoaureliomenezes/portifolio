import { useEffect, useState } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  date: string;
  lang: "pt" | "en" | "de";
  tags: string[];
}

/** The published posts from /blog/index.json; `[]` on any failure. */
export function useBlogIndex(): BlogPost[] {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    let live = true;
    fetch("/blog/index.json", { cache: "no-cache" })
      .then((res) => (res.ok ? res.json() : []))
      .then((json) => live && setPosts(Array.isArray(json) ? json : []))
      .catch(() => live && setPosts([]));
    return () => {
      live = false;
    };
  }, []);
  return posts;
}

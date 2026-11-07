import { Link } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import type { BlogPost } from "@/lib/blogIndex";

export function PostMeta({ post }: { post: BlogPost }) {
  const { language, content } = useContent();
  const date = new Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${post.date}T00:00:00Z`),
  );
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <time dateTime={post.date}>{date}</time>
      <span lang={post.lang} className="rounded border px-1.5 text-xs">
        {post.lang.toUpperCase()}
      </span>
      {post.tags.length > 0 && <span>{content.siteChrome.blog.tagsLabel}</span>}
      {post.tags.map((tag) => (
        <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="hover:underline">
          {tag}
        </Link>
      ))}
    </div>
  );
}

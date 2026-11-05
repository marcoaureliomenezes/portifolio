import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useBlogIndex } from "@/lib/blogIndex";
import { PROSE } from "@/lib/layout";
import { PostMeta } from "@/components/blog/PostMeta";
import NotFound from "@/pages/NotFound";

export function BlogPostPage() {
  const { slug = "" } = useParams();
  const { content } = useContent();
  const index = useBlogIndex();
  const post = index?.find((p) => p.slug === slug);
  // undefined: pending; html null: failed.
  const [body, setBody] = useState<{ slug: string; html: string | null }>();
  useEffect(() => {
    if (!post) return;
    let live = true;
    fetch(`/blog/${encodeURIComponent(slug)}/body.html`)
      .then((res) => (res.ok ? res.text() : null))
      .catch(() => null)
      .then((html) => live && setBody({ slug, html }));
    return () => {
      live = false;
    };
  }, [post, slug]);
  useDocumentSeo({ title: post?.title ?? "", description: post?.description ?? "" });

  if (!index) return null;
  if (!post) return <NotFound />;
  if (body?.slug !== slug) return null;
  if (body.html === null) return <NotFound />;

  return (
    <div className={`${PROSE} space-y-6`}>
      <Link to="/blog" className="text-sm underline">
        {content.siteChrome.blog.back}
      </Link>
      <h1 className="text-title-sm md:text-title text-primary">{post.title}</h1>
      <PostMeta post={post} />
      {/* Safe: build-blog.mjs escapes raw HTML and limits link schemes (AC2.3). */}
      <article lang={post.lang} dangerouslySetInnerHTML={{ __html: body.html }} />
    </div>
  );
}

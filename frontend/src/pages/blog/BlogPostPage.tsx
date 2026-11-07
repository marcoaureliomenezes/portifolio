import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { type BlogPost, useBlogIndex } from "@/lib/blogIndex";
import { PROSE } from "@/lib/layout";
import { PostMeta } from "@/components/blog/PostMeta";
import NotFound from "@/pages/NotFound";

export function BlogPostPage() {
  const { slug = "" } = useParams();
  const index = useBlogIndex();
  if (!index) return null;
  const post = index.find((p) => p.slug === slug);
  return post ? <PostView key={slug} post={post} /> : <NotFound />;
}

function PostView({ post }: { post: BlogPost }) {
  const { content } = useContent();
  // undefined: pending; null: failed.
  const [html, setHtml] = useState<string | null>();
  useEffect(() => {
    let live = true;
    fetch(`/blog/${encodeURIComponent(post.slug)}/body.html`)
      .then((res) => (res.ok ? res.text() : null))
      .catch(() => null)
      .then((text) => live && setHtml(text));
    return () => {
      live = false;
    };
  }, [post.slug]);
  useDocumentSeo({ title: post.title, description: post.description });

  if (html === undefined) return null;
  if (html === null) return <NotFound />;

  return (
    <div className={`${PROSE} space-y-6`}>
      <Link to="/blog" className="text-sm underline">
        {content.siteChrome.blog.back}
      </Link>
      <h1 className="text-title-sm md:text-title text-primary">{post.title}</h1>
      <PostMeta post={post} />
      {/* Safe: build-blog.mjs escapes raw HTML and limits link schemes. */}
      <article className="prose dark:prose-invert max-w-none" lang={post.lang} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

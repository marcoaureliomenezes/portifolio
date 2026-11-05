import { Link, useSearchParams } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useBlogIndex } from "@/lib/blogIndex";
import { PostMeta } from "@/components/blog/PostMeta";

export function BlogIndexPage() {
  const { content } = useContent();
  const blog = content.siteChrome.blog;
  const tag = useSearchParams()[0].get("tag");
  const posts = useBlogIndex()
    .filter((p) => !tag || p.tags.includes(tag))
    .sort((a, b) => b.date.localeCompare(a.date));
  useDocumentSeo({ title: blog.title, description: blog.intro });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-title-sm md:text-title text-primary">{blog.title}</h1>
        <p className="text-muted-foreground">{blog.intro}</p>
        {tag && (
          <p className="text-sm">
            {blog.filteredBy} <strong>{tag}</strong> ·{" "}
            <Link to="/blog" className="underline">
              {blog.allPosts}
            </Link>
          </p>
        )}
      </div>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">{blog.empty}</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="space-y-1">
              <Link to={`/blog/${post.slug}`} className="text-lg font-semibold hover:underline">
                {post.title}
              </Link>
              <p>{post.description}</p>
              <PostMeta post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { GetStaticPaths, GetStaticProps } from "next";
import { BlogPost } from "@/app/model/blog"; // Import your types
import BlogPostScaffold from "@/app/components/blog/BlogPostScaffold";
import { fitnessLevelOneBlogPosts } from "@/app/data/articles";

interface BlogPostPageProps {
  post: BlogPost;
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate paths for all fitnessLevelOneBlogPosts
  const paths = fitnessLevelOneBlogPosts.map((post) => ({
    params: {
      slug: post.href.split("/"),
    },
  }));

  return {
    paths,
    fallback: "blocking", // Use 'blocking' to server-render any missing pages at request time
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async (
  context
) => {
  let slug: string[] = context.params!.slug as string[];

  // Ensure 'slug' is an array (it should be, given the catch-all route)
  if (!Array.isArray(slug)) {
    slug = [slug];
  }
  // Check if the last part of the slug is numeric and remove it
  const lastSegment = slug[slug.length - 1];
  let fitnessLevel: number = 2;

  if (!isNaN(Number(lastSegment))) {
    slug.pop(); // Remove the last segment if it's a number
    fitnessLevel = Number(lastSegment);
  }

  // Now 'slug' is modified to exclude the numeric part
  // Use the modified 'slug' to fetch your data or perform other operations
  const postSlug = slug.join("/");

  let post: BlogPost | undefined;

  post = fitnessLevelOneBlogPosts.find((post) => post.href === postSlug);

  if (!post) {
    console.error(`Post with slug ${postSlug} not found`);
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60, // Revalidate the page every 60 seconds to keep it fresh
  };
};

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  return <BlogPostScaffold post={post} />;
};

export default BlogPostPage;

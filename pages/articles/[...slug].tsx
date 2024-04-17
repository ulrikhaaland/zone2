import { GetServerSideProps } from "next";
import { BlogPost } from "@/app/model/blog"; // Import your types
import BlogPostScaffold from "@/app/components/blog/BlogPostScaffold";
import { fitnessLevelOneBlogPosts } from "@/app/data/articles";
// Assume fetchBlogPostBySlug is properly typed to return a BlogPost or null

interface BlogPostPageProps {
  post: BlogPost;
}

// Define the type for the `getServerSideProps` function
export const getServerSideProps: GetServerSideProps = async (context) => {
  let slug: string[] = context.params!.slug! as string[];

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
  };
};

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  return <BlogPostScaffold post={post} />;
};

export default BlogPostPage;

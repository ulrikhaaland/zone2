import { FitnessLevel, User } from "@/app/model/user";
import Image from "next/image";
import { useRouter } from "next/router";
import { fitnessLevelOneBlogPosts } from "@/app/data/articles";

interface Props {
  user?: User | null;
}

export default function SectionBlog({ user }: Props) {
  const router = useRouter();

  const goToBlogpost = (path: string) => {
    router.push(`articles/${path}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {fitnessLevelOneBlogPosts.map((post) => (
          <article
            key={post.title}
            className="max-w-xl flex-col items-start justify-between"
          >
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <span
                style={{
                  cursor: "pointer",
                }}
                onClick={() => goToBlogpost(post.href)}
              >
                <Image
                  src={post.imagePath}
                  alt={post.title}
                  width={384}
                  height={256}
                  className="w-full h-full object-cover object-center transition duration-500 ease-in-out transform hover:scale-110"
                />
              </span>
            </div>
            <div
              style={{
                paddingTop: 8,
              }}
              className="flex items-center gap-x-4 text-xs"
            >
              <div
                className="
                    flex
                    gap-x-2
                    items-center
                    text-xs
                    font-medium
                    text-gray-600
                    hover:text-gray-900
                "
              >
                {/* {post.categories?.map((category) => (
                  <span
                    key={category}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => goToBlogpost(post.href)}
                    className="relative z-10 rounded-full border border-gray-700 px-3 py-1 font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {category}
                  </span>
                ))} */}
              </div>
            </div>

            <div className="relative">
              <h3
                className="mt-2 text-lg font-semibold leading-6 text-whitebg hover:text-gray-600"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => goToBlogpost(post.href)}
              >
                {post.title}
              </h3>
              <p
                style={{}}
                className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500"
              >
                {post.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

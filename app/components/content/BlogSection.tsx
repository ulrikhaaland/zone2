import { User } from "@/app/model/user";
import image from "../../../assets/posts/future.png";
import Image from "next/image";
import { useRouter } from "next/router";
import { fitnessLevelOneBlogPosts } from "@/app/data/fitness-level/one";

interface Props {
  user?: User | null;
}

export default function SectionBlog({ user }: Props) {
  const router = useRouter();

  const goToBlogpost = (path: string) => {
    const fitnessLevel = user?.fitnessLevel || 1;
    router.push(`articles/${path}${fitnessLevel && `/${fitnessLevel}`}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {fitnessLevelOneBlogPosts.map((post) => (
          <article
            key={post.title}
            className="flex max-w-xl flex-col items-start justify-between"
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
                {post.categories?.map((category) => (
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
                ))}
              </div>
            </div>

            <div className="group relative">
              <h3 className="mt-2 text-lg font-semibold leading-6 text-whitebg group-hover:text-gray-600">
                <span
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => goToBlogpost(post.href)}
                >
                  <span className="absolute inset-0" />
                  {post.title}
                </span>
              </h3>
              <p
                style={{
                  whiteSpace: "pre-wrap",
                }}
                className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600"
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

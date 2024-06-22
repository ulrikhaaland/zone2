import { useStore } from "@/RootStoreProvider";
import { BlogPost } from "@/app/model/blog";
import { observer } from "mobx-react";
import { useEffect, useRef } from "react";
import BlogSection from "./BlogPostSection";
import Head from "next/head";

interface BlogPostScaffoldProps {
  post: BlogPost;
}

const BlogPostScaffold: React.FC<BlogPostScaffoldProps> = ({ post }) => {
  const { generalStore } = useStore();
  const { isMobileView, setScrollableContentRef } = generalStore;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScrollableContentRef(containerRef);
  }, [containerRef, setScrollableContentRef]);

  return (
    <div className="w-full font-custom min-h-screen flex relative bg-white">
      <Head>
        <title>{post.title}</title>
      </Head>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        {!isMobileView && (
          <div
            style={{
              backgroundImage: `url(${post.imagePath})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          ></div>
        )}
        <div
          className={isMobileView ? "bg-blackbg" : "bg-black/70"}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        ></div>
      </div>
      <div
        ref={containerRef}
        className="overflow-y-auto relative w-full flex justify-center custom-scrollbar"
        style={{
          height: `100vh`,
          WebkitOverflowScrolling: "touch", // Enable momentum scrolling on iOS
        }}
      >
        <div className="w-[800px] pt-24 relative flex flex-col">
          <h1
            className="md:text-4xl text-4xl md:px-0 px-4 text-whitebg text-center font-bold mb-4 relative z-10"
            style={{
              textShadow: "10px 10px 10px rgba(0,0,0,1)",
            }}
          >
            {post.title}
          </h1>
          <div className="flex md:rounded flex-col items-center md:p-4 relative">
            <div className="flex justify-center w-full md:shadow-md">
              <div
                className={`justify-center items-center relative
                        inset-0 rounded-lg md:border md:border-gray-700
                        ${isMobileView ? "mx-4" : "bg-black bg-opacity-60"}`}
              >
                <div className="px-4 pb-4 text-whitebg">
                  <ul className="list-none">
                    {post.items.map((item, index) => (
                      <BlogSection
                        key={item.id}
                        item={item}
                        isSubItem={false}
                        isLast={index === post.items.length - 1}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(BlogPostScaffold);

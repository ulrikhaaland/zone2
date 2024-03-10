import { useStore } from "@/RootStoreProvider";
import { BlogPost } from "@/app/model/blog";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import BlogSection from "./BlogPostSection";
import { BlogItem } from "@/app/model/blog";

interface BlogPostScaffoldProps {
  post: BlogPost;
}

const BlogPostScaffold: React.FC<BlogPostScaffoldProps> = ({ post }) => {
  const { generalStore } = useStore();
  const { isMobileView, setScrollableContentRef } = generalStore;

  const containerRef = useRef<HTMLDivElement>(null);

  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  useEffect(() => {
    post.items.forEach((item) => {
      item.expanded = true;
    });
  }, [post.items]);

  useEffect(() => {
    setScrollableContentRef(containerRef);
  }, [containerRef, setScrollableContentRef]);

  useEffect(() => {
    if (expandedItemId !== null && containerRef.current) {
      const itemElement = document.getElementById(
        `guide-item-${expandedItemId}`
      );
      if (itemElement) {
        const itemOffsetTop = itemElement.offsetTop;
        containerRef.current.scrollTo({
          top: itemOffsetTop,
          behavior: "smooth",
        });
      }
    }
  }, [expandedItemId]);

  const handleExpand = (item: BlogItem) => {
    setExpandedItemId(item.id);
  };

  return (
    <div className="w-full font-custom min-h-screen relative">
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
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
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
        className="overflow-y-auto"
        style={{
          height: `calc(100dvh)`,
        }}
      >
        <h1
          className="md:text-5xl text-4xl md:px-0 px-4 text-whitebg text-center font-bold pt-24 mb-4 relative z-10"
          style={{
            textShadow: "10px 10px 10px rgba(0,0,0,1)",
          }}
        >
          {post.title}
        </h1>
        <div className="flex md:rounded flex-col items-center md:p-4 relative">
          {/* Adjusted paddingTop here */}
          <div className="flex justify-center w-full md:shadow-md">
            <div
              className={`justify-center items-center relative w-[850px] 
      inset-0 bg-black bg-opacity-60 rounded-lg md:border md:border-gray-700
      ${isMobileView && "mx-4"}`}
            >
              <div
                className="px-4 pb-4 max-w-[850px] text-whitebg"
                ref={containerRef}
              >
                <ul className="list-none">
                  {post.items.map((item, index) => (
                    <BlogSection
                      key={item.id}
                      item={item}
                      isSubItem={false}
                      isLast={index === post.items.length - 1}
                      onExpand={handleExpand}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(BlogPostScaffold);

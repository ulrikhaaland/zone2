import { useStore } from "@/RootStoreProvider";
import { BlogPost } from "@/app/model/blogpost";
import { observer } from "mobx-react";
import { ReactElement, useEffect, useRef, useState } from "react";
import BlogSection from "./BlogSection";
import { BlogItem } from "@/app/model/guide";

interface BlogPostScaffoldProps {
  post: BlogPost;
}

const BlogPostScaffold: React.FC<BlogPostScaffoldProps> = ({ post }) => {
  const { generalStore } = useStore();
  const isMobileView = generalStore.isMobileView;

  const containerRef = useRef<HTMLDivElement>(null);

  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  useEffect(() => {
    if (expandedItemId !== null && containerRef.current) {
      const itemElement = document.getElementById(
        `guide-item-${expandedItemId}`
      );
      if (itemElement) {
        // Calculate the top offset of the item relative to the container
        const itemOffsetTop = itemElement.offsetTop;
        // Scroll the container to bring the item to the top
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
    <div className="w-full font-custom md:h-screen min-h-[100dvh] relative">
      {/* Background Image */}
      {/* Container for Background Image and Black Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0, // Adjust zIndex as needed
        }}
      >
        {/* Background Image */}
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

        {/* Black Overlay with Opacity */}
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Black with 50% opacity
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        ></div>
      </div>

      {/* Page Content */}
      <h1
        className="md:text-5xl text-4xl md:px-0 px-4 text-whitebg text-center font-bold pt-16 mb-4 relative z-10"
        style={{
          textShadow: "10px 10px 10px rgba(0,0,0,1)",
        }}
      >
        {post.title}
      </h1>

      {/* Page Content */}
      <div className="flex overflow-hidden md:rounded flex-col items-center min-h-max md:p-4 relative">
        <div className="flex justify-center w-full md:overflow-hidden md:shadow-md md:min-h-[73.5dvh] md:max-h-[77.5dvh] min-h-[76.5dvh] max-h-[76.5dvh]">
          <div
            className={`md:min-h-[72.5dvh] md:max-h-[72.5dvh] 
      justify-center items-center min-h-screen relative w-[850px] 
      inset-0 bg-black bg-opacity-60 rounded-lg md:border md:border-gray-700
      ${isMobileView && "mx-4"}`}
          >
            <div
              className="px-4 pb-4 h-full overflow-y-auto max-w-[850px] mx-auto text-whitebg custom-scrollbar"
              ref={containerRef}
              style={{
                height: isMobileView ? "calc(100dvh - 150px)" : "",
              }}
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
  );
};

export default observer(BlogPostScaffold);

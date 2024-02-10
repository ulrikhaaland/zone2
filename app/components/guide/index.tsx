import React, { useEffect, useRef, useState } from "react";
import { GuideStatus } from "../../model/user";
import { GuideItem } from "../../model/guide";
import GuideSection from "./GuideSection";
import "./styles.css";
import { GuideSkeleton } from "./skeleton";
import { Create as CreateIcon } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";

interface GuideProps {
  guideItems?: GuideItem[];
  status: GuideStatus;
}

export default function Guide(props: GuideProps) {
  const { generalStore } = useStore();
  const { isMobileView } = generalStore;

  const router = useRouter();

  const [guideItems, setGuideItems] = useState<GuideItem[]>(
    props.guideItems || []
  );
  const [status, setStatus] = useState(props.status);

  const containerRef = useRef<HTMLDivElement>(null); // Add this line

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
  const handleExpand = (item: GuideItem) => {
    setExpandedItemId(item.id);
  };

  const renderGuideItems = (items: GuideItem[]) => (
    <ul className="list-none p-0">
      {items.map((item, index) => (
        <GuideSection
          key={item.id}
          item={item}
          isSubItem={false}
          isLast={index === items.length - 1}
          onExpand={handleExpand}
        />
      ))}
    </ul>
  );

  const getContent = (): React.JSX.Element => {
    switch (status) {
      case GuideStatus.NONE:
        return (
          <div className="flex justify-center items-center h-full">
            <button
              className="flex justify-center items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out bg-whitebg text-black border border-gray-700"
              onClick={() => {
                router.push("/zone2guide");
              }}
            >
              <CreateIcon className="mr-2" style={{ color: "black" }} />
              Create your guide
            </button>
          </div>
        );
      case GuideStatus.LOADED:
        return renderGuideItems(guideItems);
      case GuideStatus.LOADING:
        // Return skeleton loader
        return <GuideSkeleton />;
      case GuideStatus.ERROR:
        return <p className="text-center">Error generating guide</p>;
      default:
        return <GuideSkeleton />; // Fallback or initial loading state
    }
  };

  return (
    <div
      className={`md:min-h-[72.5dvh] md:max-h-[72.5dvh] 
      justify-center items-center min-h-screen relative w-[850px] 
      inset-0 bg-black bg-opacity-60 rounded-lg md:border md:border-gray-700
      ${isMobileView && "mx-4"}`}
    >
      <div
        className="px-4 h-full overflow-y-auto max-w-[850px] mx-auto text-whitebg custom-scrollbar"
        ref={containerRef}
        style={{
          height: isMobileView ? "calc(100dvh - 150px)" : "",
        }}
      >
        {getContent()}
      </div>
    </div>
  );
}

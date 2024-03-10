import React, { useEffect, useRef, useState } from "react";
import { GuideStatus, User } from "../../model/user";
import { GuideItem } from "../../model/guide";
import GuideSection from "./GuideSection";
import "./styles.css";
import { GuideSkeletonDesktop, GuideSkeletonMobile } from "./skeleton";
import { Create as CreateIcon } from "@mui/icons-material";
import { Replay as ReplayIcon } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";
import { GuideSideNavigation } from "./SideNavigation";

interface GuideProps {
  guideItems?: GuideItem[];
  status: GuideStatus;
  generateGuide: () => void;
  onScrolledToTopOrBottom?: (scrolledTopOrBottom: boolean) => void;
}

export default function Guide(props: GuideProps) {
  const { generalStore, authStore } = useStore();
  const { isMobileView } = generalStore;
  const { user } = authStore;

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
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrolledToTop = scrollTop === 0;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight;

      if (scrolledToTop || scrolledToBottom) {
        // Call the prop function with true when scrolled to top or bottom
        props.onScrolledToTopOrBottom?.(true);
      } else {
        // Optionally, call the prop function with false when not at edges
        // This is useful if you want to toggle some state based on scroll position
        props.onScrolledToTopOrBottom?.(false);
      }
    };

    // Add the scroll event listener
    const currentContainer = containerRef.current;
    currentContainer?.addEventListener("scroll", handleScroll);

    // Cleanup function to remove the event listener
    return () => {
      currentContainer?.removeEventListener("scroll", handleScroll);
    };
  }, [expandedItemId]);

  const handleExpand = (item: GuideItem) => {
    setExpandedItemId(item.id);
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth", // This makes the scroll smooth
      });
    }
  };

  const scrollToItem = async (item: GuideItem) => {
    let itemElement = document.getElementById(`guide-item-${item.id}`);

    if (itemElement === null && item.parentId) {
      const parentItem = guideItems.find((i) => i.id === item.parentId);
      if (parentItem) {
        parentItem.expanded = true;
        // timer
        return setTimeout(() => {
          scrollToItem(item);
        }, 50);
      }
    }

    if (itemElement && containerRef.current) {
      if (!item.expanded) {
        item.expanded = true;
        /// await 50 ms
        return setTimeout(() => {
          scrollToItem(item);
        }, 50);
      }
      console.log("scrolling to item", item.title);
      const itemOffsetTop =
        itemElement.offsetTop - containerRef.current.offsetTop; // Adjust if your item's offset is calculated differently
      containerRef.current.scrollTo({
        top: itemOffsetTop,
        behavior: "smooth",
      });
    }
  };

  const handleCollapse = (item: GuideItem) => {
    // Assume collapsedItemId is the ID of the item that was just collapsed.
    let previousExpandedItem = null;

    // Find the closest previous item that is expanded.
    for (let i = item.id - 1; i >= 0; i--) {
      const item = guideItems.find(
        (item) => item.id === i && item.expanded && !item.parentId
      );
      if (item) {
        previousExpandedItem = item;
        break;
      }
    }

    if (previousExpandedItem !== null) {
      // If a previous expanded item exists, scroll to it
      scrollToItem(previousExpandedItem);
    } else {
      // If no previous expanded item exists, scroll to the top
      scrollToTop();
    }
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
          onCollapse={(item) => handleCollapse(item)}
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
                router.push("/guide");
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
        return isMobileView ? (
          <GuideSkeletonMobile />
        ) : (
          <GuideSkeletonDesktop />
        );
      case GuideStatus.ERROR || GuideStatus.HASPAID:
        return (
          <div className="flex flex-col justify-center items-center h-full">
            <p className="text-whitebg text-center mb-4">
              There was an error creating your guide. Please try again.
            </p>
            <button
              className="flex justify-center items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out bg-whitebg text-black border border-gray-700"
              onClick={() => props.generateGuide()}
              disabled={user !== undefined && user!.retries! >= 5}
            >
              <ReplayIcon className="mr-2" style={{ color: "black" }} />
              Retry
            </button>
          </div>
        );
      default:
        return isMobileView ? (
          <GuideSkeletonMobile />
        ) : (
          <GuideSkeletonDesktop />
        );
    }
  };

  const content = (
    <div
      className={`${
        status === GuideStatus.LOADING
          ? "md:min-h-[62.5dvh]"
          : "md:min-h-[72.5dvh]"
      } md:max-h-[72.5dvh] 
        justify-center items-center min-h-screen relative w-[850px] 
        inset-0 bg-black bg-opacity-60 rounded-lg md:border md:border-gray-700
        ${isMobileView && "mx-4"}`}
    >
      <div
        className="p-4 h-full overflow-y-auto max-w-[850px] mx-auto text-whitebg custom-scrollbar"
        ref={containerRef}
        style={{
          height: isMobileView ? "calc(100dvh - 150px)" : "",
        }}
      >
        {getContent()}
      </div>
    </div>
  );

  if (!isMobileView && status === GuideStatus.LOADED) {
    return (
      <div className="flex min-h-screen">
        {status === GuideStatus.LOADED && !isMobileView && (
          <GuideSideNavigation items={guideItems} scrollToItem={scrollToItem} />
        )}
        {content}
      </div>
    );
  }

  return content;
}

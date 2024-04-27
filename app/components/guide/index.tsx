import React, { useEffect, useRef, useState } from "react";
import { GuideStatus, User } from "../../model/user";
import { GuideItem } from "../../model/guide";
import GuideSection from "./GuideSection";
import {
  GuideSkeletonDesktop,
  GuideSkeletonMobile,
  shimmerItems,
} from "./skeleton";
import { Create as CreateIcon } from "@mui/icons-material";
import { Replay as ReplayIcon } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";
import { observer } from "mobx-react";
import GuideSideNavigation from "./SideNavigation";

interface GuideProps {
  status: GuideStatus;
  generateGuide: () => void;
  onScrolledToTopOrBottom?: (scrolledTopOrBottom: boolean) => void;
}

const Guide = (props: GuideProps) => {
  const { status, generateGuide, onScrolledToTopOrBottom } = props;
  const { generalStore, authStore, guideStore } = useStore();
  const { isMobileView } = generalStore;
  const { user } = authStore;
  const { guideItems } = guideStore;

  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null); // Add this line

  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  useEffect(() => {}, [guideItems]);

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
        onScrolledToTopOrBottom?.(true);
      } else {
        // Optionally, call the prop function with false when not at edges
        // This is useful if you want to toggle some state based on scroll position
        onScrolledToTopOrBottom?.(false);
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

  const renderGuideItems = () => (
    <div>
      <ul className="list-none p-0">
        {guideItems.map((item, index) => (
          <GuideSection
            key={item.id}
            item={item}
            isSubItem={false}
            isLast={index === guideItems.length - 1}
            onExpand={handleExpand}
            onCollapse={(item) => handleCollapse(item)}
          />
        ))}
      </ul>
      {status === GuideStatus.LOADING && (
        <div role="status" className="max-w mb-12">
          {shimmerItems
            .slice(guideItems.length * 6 <= 20 ? guideItems.length * 6 : 20, 30)
            .map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </div>
  );

  const getContent = (): React.JSX.Element => {
    if (GuideStatus.LOADED || guideItems.length > 0) return renderGuideItems();

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
        return renderGuideItems();
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
              onClick={() => generateGuide()}
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
      className={`
        justify-center h-full items-center relative w-[850px] 
        inset-0 bg-black bg-opacity-60 rounded-lg md:border md:border-gray-700
        ${isMobileView && "mx-4"}`}
    >
      <div
        className="px-4 mt-2 h-full overflow-y-auto max-w-[850px] mx-auto text-whitebg custom-scrollbar"
        ref={containerRef}
        style={{
          height: isMobileView
            ? status === GuideStatus.LOADING
              ? "calc(100dvh - 250px)"
              : "calc(100dvh - 150px)"
            : "",
        }}
      >
        {getContent()}
      </div>
    </div>
  );

  if (!isMobileView && (status === GuideStatus.LOADED || GuideStatus.LOADING)) {
    return (
      <div
        className={`flex ${
          status === GuideStatus.LOADING ? "h-[62.5dvh]" : "h-[74.5dvh]"
        }`}
      >
        <GuideSideNavigation scrollToItem={scrollToItem} status={status} />
        {content}
      </div>
    );
  }

  return content;
};

export default observer(Guide);

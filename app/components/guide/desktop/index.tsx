import React, { useEffect, useRef, useState } from "react";
import { GuideStatus, User } from "../../../model/user";
import { GuideItem } from "../../../model/guide";
import GuideSection from "./GuideSection";
import {
  GuideSkeletonDesktop,
  GuideSkeletonMobile,
  shimmerItems,
} from "../skeleton";
import { Create as CreateIcon } from "@mui/icons-material";
import { Replay as ReplayIcon } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";
import { observer } from "mobx-react";
import GuideSideNavigation from "./SideNavigation";
import FeedbackFAB from "../../feedback";

interface GuideDesktopLayoutProps {
  status: GuideStatus;
  generateGuide: () => void;
  showFeedback: boolean;
  onScrolledToTopOrBottom?: (scrolledTopOrBottom: boolean) => void;
}

const GuideDesktopLayout: React.FC<GuideDesktopLayoutProps> = ({
  status,
  generateGuide,
  showFeedback,
  onScrolledToTopOrBottom,
}) => {
  const { authStore, guideStore } = useStore();
  const { user } = authStore;
  const { guideItems } = guideStore;

  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);

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
        <div
          role="status"
          className={`max-w ${guideItems.length * 6 > 18 && "mb-8"}`}
        >
          {shimmerItems
            .slice(guideItems.length * 6 <= 18 ? guideItems.length * 6 : 18, 30)
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
                router.push("/create");
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
        return <GuideSkeletonDesktop />;
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
        return <GuideSkeletonDesktop />;
    }
  };

  let content = (
    <div
      className="justify-center h-full items-center relative w-[850px] 
        inset-0 bg-black/60 rounded-lg md:border md:border-gray-700"
    >
      <div
        className="px-4 mt-2 h-full overflow-y-auto max-w-[850px] mx-auto text-whitebg custom-scrollbar"
        ref={containerRef}
      >
        {getContent()}
      </div>
    </div>
  );

  if (status === GuideStatus.LOADED || GuideStatus.LOADING) {
    content = (
      <div className="">
        {status === GuideStatus.LOADING && (
          <>
            <h1
              className={`text-5xl text-whitebg text-center font-bold mb-4 relative z-10 ${
                status === GuideStatus.LOADING ? "animate-pulse" : ""
              }`}
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              {status === GuideStatus.LOADING
                ? "Generating Guide..."
                : "Your Personalized Fitness Guide"}
            </h1>
            <p
              className={`text-whitebg text-center text-m mb-4 relative z-10`}
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              This will take a few minutes — feel free to wait or come back
              later...
            </p>
          </>
        )}
        <div
          className={`flex ${
            status === GuideStatus.LOADING ? "h-[72.5dvh]" : "h-[84.5dvh]"
          }`}
        >
          <GuideSideNavigation scrollToItem={scrollToItem} status={status} />
          {content}
        </div>
        {showFeedback && <FeedbackFAB />}
      </div>
    );
  }

  return (
    <div className="w-full font-custom h-screen overflow-hidden relative">
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
            backgroundImage: "url('/assets/images/cyclist/cyclist.png')",
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
      <div className="pt-24">
        {/* Page Content */}
        <div className="flex overflow-hidden md:rounded flex-col items-center min-h-max p-4 relative">
          <div className="md:overflow-hidden md:shadow-md">{content}</div>
        </div>
      </div>
    </div>
  );
};

export default observer(GuideDesktopLayout);

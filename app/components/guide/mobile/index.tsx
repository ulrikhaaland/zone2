import { useStore } from "@/RootStoreProvider";
import { GuideItem } from "@/app/model/guide";
import { GuideStatus } from "@/app/model/user";
import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import MobileNavigationMenu from "./MobileNavigationMenu";
import MobileGuideSection from "./MobileGuideSection";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import "./style.css";
import BottomSheetHeader from "./BottomSheetHeader";
import { RefHandles, SpringEvent } from "react-spring-bottom-sheet/dist/types";
import FeedbackFAB from "../../feedback";

interface GuideMobileLayoutProps {
  status: GuideStatus;
  showFeedback: boolean;
}

// Add this method inside your Guide component
const GuideMobileLayout: React.FC<GuideMobileLayoutProps> = ({
  status,
  showFeedback,
}) => {
  const { guideStore } = useStore();
  const { guideItems, guideItemsCount } = guideStore;
  const [currentItem, setCurrentItem] = React.useState<GuideItem | undefined>(
    guideItems.length > 0 ? guideItems[0] : undefined
  );
  const [previousItem, setPreviousItem] = React.useState<GuideItem | undefined>(
    undefined
  );
  const [nextItem, setNextItem] = React.useState<GuideItem | undefined>(
    undefined
  );
  const [expanded, setExpanded] = React.useState(true);
  const [maxHeight] = useState(window.innerHeight - 180);
  const [init, setInit] = useState(false);
  const [scrolledToTopOrBottom, setScrolledToTopOrBottom] = useState(true);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number>(0);
  const sheetRef = useRef<RefHandles | null>(null);

  const isLoading = status === GuideStatus.LOADING;

  useEffect(() => {
    if (guideItems.length > 0) {
      if (!currentItem) {
        setCurrentItem(guideItems[0]);
      }

      const indexOfCurrentItem = guideItems.findIndex(
        (item) => item.id === currentItem?.id
      );
      if (indexOfCurrentItem > 0) {
        setPreviousItem(guideItems[indexOfCurrentItem - 1]);
      } else {
        setPreviousItem(undefined);
      }
      if (indexOfCurrentItem < guideItems.length - 1) {
        setNextItem(guideItems[indexOfCurrentItem + 1]);
      } else {
        setNextItem(undefined);
      }
    }
  }, [currentItem, guideItems.length]);

  const scrollToItem = async (item: GuideItem) => {
    let itemElement = document.getElementById(`guide-item-${item.id}`);

    if (itemElement && containerRef.current) {
      const itemOffsetTop =
        itemElement.offsetTop - containerRef.current.offsetTop;
      containerRef.current.scrollTo({
        top: itemOffsetTop,
        behavior: "smooth",
      });
    }
  };

  const handleOnSetCurrentItem = (item: GuideItem) => {
    if (item.parentId) {
      const parentItem = guideItems.find((i) => i.id === item.parentId);
      setCurrentItem(parentItem);
      setTimeout(() => {
        scrollToItem(item);
      }, 50);
    } else {
      setCurrentItem(item);
    }
    collapseSheet();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && currentItem) {
        expandSheet();
      } else {
        console.log("Collapsing sheet");
        setInit(true);
        collapseSheet();
      }
    }, 1000); // Delaying the execution slightly to ensure the component is ready

    return () => clearTimeout(timer); // Cleanup the timer
  }, [sheetRef.current]);

  useEffect(() => {
    if (expanded) {
      expandSheet();
    } else {
      collapseSheet();
    }
  }, [expanded]);

  const collapseSheet = () => {
    if (sheetRef.current) {
      if (expanded) setExpanded(false);
      sheetRef.current.snapTo(0); // Snap to the index corresponding to minHeight
      lastHeightRef.current = 0;
    }
  };

  const expandSheet = () => {
    if (sheetRef.current) {
      if (!expanded) setExpanded(true);
      sheetRef.current.snapTo(maxHeight);
      lastHeightRef.current = maxHeight;
    }
  };

  const handleOnSpringStart = (event: SpringEvent) => {
    if (event.type === "SNAP" && event.source !== "custom") {
      const currentHeight = getCurrentHeightSheetHeight(); // Implement this method based on your setup
      if (currentHeight > lastHeightRef.current) {
        setExpanded(true); // Assuming upward movement enlarges the height
      } else {
        setExpanded(false); // Downward movement or unchanged
      }
      lastHeightRef.current = currentHeight; // Update last known height
    }
  };

  return (
    <div className="w-full pt-16 font-custom h-full overflow-hidden relative">
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

      {/* Page Content */}
      <div className="flex flex-col items-center relative">
        <div className="w-full">
          <>
            <BottomSheet
              ref={sheetRef}
              className="text-whitebg"
              open={true}
              scrollLocking={false}
              blocking={false}
              expandOnContentDrag={false}
              maxHeight={maxHeight}
              onSpringStart={handleOnSpringStart}
              snapPoints={({}) => [
                isLoading && !nextItem ? 100 : 80,
                maxHeight,
              ]}
              footer={
                <BottomSheetHeader
                  status={status}
                  setCurrentItem={handleOnSetCurrentItem}
                  currentItem={currentItem}
                  previousItem={previousItem}
                  nextItem={nextItem}
                  expanded={!init ? false : expanded}
                  onExpand={setExpanded}
                />
              }
            >
              {expanded && currentItem ? (
                <MobileNavigationMenu
                  setCurrentItem={handleOnSetCurrentItem}
                  status={status}
                  expanded={expanded}
                />
              ) : (
                <div className="text-transparent text-sm">asd</div>
              )}
            </BottomSheet>

            {currentItem && (
              <div className="mx-4 justify-center text-bgwhite">
                <div
                  key={currentItem.id + "container"}
                  ref={containerRef}
                  className="w-full bg-black/60 px-4 rounded-lg md:border md:border-gray-700 items-center justify-center overflow-y-auto"
                  style={{ height: "calc(100vh - 150px)" }}
                >
                  <ul className="list-none p-0 pb-12">
                    <MobileGuideSection
                      key={currentItem.id}
                      item={currentItem}
                      isSubItem={false}
                      isLast={true}
                    />
                  </ul>
                </div>
              </div>
            )}
          </>
        </div>
      </div>
      {feedbackExpanded && showFeedback && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20" // Backdrop with semi-transparent background
          onClick={() => setFeedbackExpanded(false)} // Close feedback form when backdrop is clicked
        ></div>
      )}
      {scrolledToTopOrBottom && showFeedback && (
        <FeedbackFAB
          onExpand={setFeedbackExpanded}
          expanded={feedbackExpanded}
        />
      )}
    </div>
  );
};

export default observer(GuideMobileLayout);

function getCurrentHeightSheetHeight(): number {
  const sheetElement = document.querySelector('div[role="dialog"]');
  console.log(sheetElement?.clientHeight);
  return sheetElement ? sheetElement.clientHeight : 0;
}

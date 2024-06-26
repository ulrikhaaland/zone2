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
import BottomSheetHeader from "./BottomSheetFooter";
import { RefHandles, SpringEvent } from "react-spring-bottom-sheet/dist/types";
import FeedbackFAB from "../../feedback";
import Loading from "../../loading";
import GuideMobileContent from "./PageContent";
import BottomSheetFooter from "./BottomSheetFooter";

interface GuideMobileLayoutProps {
  status: GuideStatus;
  generateGuide: () => void;
}

// Add this method inside your Guide component
const GuideMobileLayout: React.FC<GuideMobileLayoutProps> = ({
  status,
  generateGuide,
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
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number>(0);
  const sheetRef = useRef<RefHandles | null>(null);

  const isLoading = status === GuideStatus.LOADING;

  const resetItems = () => {
    setCurrentItem(undefined);
    setNextItem(undefined);
    setPreviousItem(undefined);
  };

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
    } else {
      resetItems();
    }
  }, [currentItem, guideItemsCount]);

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
    if (feedbackExpanded) setFeedbackExpanded(false);

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
    <div
      className="w-full pt-16 bg-blackbg font-custom h-full overflow-hidden relative"
      onClick={collapseSheet}
    >
      <div
        style={{
          height: "100dvh",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0, // Adjust zIndex as needed
        }}
      >
        {
          <>
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
            <div
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.8)", // Black with 50% opacity
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            ></div>
          </>
        }
        {status === GuideStatus.LOADING && !currentItem && <Loading />}
      </div>

      {/* Page Content */}
      <div className="flex flex-col items-center relative">
        <div className="w-full">
          <>
            <BottomSheet
              ref={sheetRef}
              className="text-whitebg"
              open={
                !feedbackExpanded &&
                (status === GuideStatus.LOADING ||
                  status === GuideStatus.LOADED)
              }
              scrollLocking={false}
              blocking={false}
              expandOnContentDrag={false}
              maxHeight={maxHeight}
              onSpringStart={handleOnSpringStart}
              snapPoints={({}) => [
                isLoading && guideItems.length < 2 ? 100 : 80,
                maxHeight,
              ]}
              footer={
                <BottomSheetFooter
                  status={status}
                  setCurrentItem={handleOnSetCurrentItem}
                  previousItem={previousItem}
                  nextItem={nextItem}
                  expanded={!init ? false : expanded}
                  onExpand={setExpanded}
                  onProvideFeedback={() => {
                    setFeedbackExpanded(true);
                  }}
                  feedbackExpanded={feedbackExpanded}
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
            <GuideMobileContent
              feedbackExpanded={feedbackExpanded}
              setFeedbackExpanded={setFeedbackExpanded}
              currentItem={currentItem}
              containerRef={containerRef}
              status={status}
              generateGuide={() => {
                guideStore.setGuideItems([]); // Clear guide items
                resetItems();
                generateGuide();
              }}
            />
          </>
        </div>
      </div>
    </div>
  );
};

export default observer(GuideMobileLayout);

function getCurrentHeightSheetHeight(): number {
  const sheetElement = document.querySelector('div[role="dialog"]');
  console.log(sheetElement?.clientHeight);
  return sheetElement ? sheetElement.clientHeight : 0;
}

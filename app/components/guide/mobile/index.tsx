import { useStore } from "@/RootStoreProvider";
import { GuideItem } from "@/app/model/guide";
import { GuideStatus } from "@/app/model/user";
import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import MobileNavigationMenu from "./MobileNavigationMenu";
import GuideSection from "../GuideSection";
import MobileGuideSection from "./MobileGuideSection";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import "./style.css";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import BottomSheetHeader from "./BottomSheetHeader";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";
import guide from "@/pages/guide";

interface MobileGuideViewerProps {
  status: GuideStatus;
}

// Add this method inside your Guide component
const MobileGuideViewer: React.FC<MobileGuideViewerProps> = ({ status }) => {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<RefHandles | null>(null);

  const isLoading = status === GuideStatus.LOADING;

  useEffect(() => {
    if (guideItems.length > 0) {
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
    } else setCurrentItem(item);
    collapseSheet();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        expandSheet();
      } else {
        console.log("Collapsing sheet");
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
    }
  };

  const expandSheet = () => {
    if (sheetRef.current) {
      if (!expanded) setExpanded(true);
      sheetRef.current.snapTo(maxHeight);
    }
  };

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        className="text-whitebg"
        open={true}
        scrollLocking={false}
        blocking={false}
        expandOnContentDrag={false}
        maxHeight={maxHeight}
        snapPoints={({ footerHeight }) => [
          isLoading && !nextItem ? 130 : 80,
          maxHeight,
        ]}
        footer={
          <BottomSheetHeader
            status={status}
            setCurrentItem={handleOnSetCurrentItem}
            currentItem={currentItem}
            previousItem={previousItem}
            nextItem={nextItem}
            expanded={expanded}
            onExpand={setExpanded}
          />
        }
        // footer={x
        //   <button
        //     className="w-full p-2 text-white bg-blue-500"
        //     onClick={() => setOpen(false)}
        //   >
        //     Close
        //   </button>
        // }
      >
        {expanded && (
          <MobileNavigationMenu
            setCurrentItem={handleOnSetCurrentItem}
            status={status}
            expanded={expanded}
          />
        )}
      </BottomSheet>

      {currentItem && (
        <div className="mx-4 justify-center text-bgwhite">
          <div
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
  );
};

export default observer(MobileGuideViewer);

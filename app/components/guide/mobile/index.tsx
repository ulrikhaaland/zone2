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
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

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
  const [maxHeight] = useState(window.innerHeight - 200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (guideItems.length > 0) {
      const indexOfCurrentItem = guideItems.findIndex(
        (item) => item.id === currentItem?.id
      );
      if (indexOfCurrentItem > 0) {
        setPreviousItem(guideItems[indexOfCurrentItem - 1]);
      }
      if (indexOfCurrentItem < guideItems.length - 1) {
        setNextItem(guideItems[indexOfCurrentItem + 1]);
      }
    }
  }, [currentItem]);

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
  };

  return (
    <>
      <BottomSheet
        className="text-whitebg"
        open={true}
        scrollLocking={false}
        blocking={false}
        expandOnContentDrag={true}
        maxHeight={maxHeight}
        snapPoints={({}) => [100, maxHeight]}
        header={
          <div className="h-[72px] w-full pt-2">
            <div className="w-full h-full justify-between">
              <div>
                <div className="flex w-full h-full items-center justify-between">
                  <button
                    className="w-[40%] h-[50px] flex items-center justify-start text-sm"
                    onClick={() => setCurrentItem(previousItem!)}
                  >
                  
                    <NavigateBeforeIcon />
                    <p> {previousItem?.title}</p>
                  </button>
                  <button
                    className="w-[40%] h-[50px] flex items-center justify-end text-sm"
                    onClick={() => setCurrentItem(nextItem!)}
                  >
                    <p> {nextItem?.title}</p> <NavigateNextIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        // footer={
        //   <button
        //     className="w-full p-2 text-white bg-blue-500"
        //     onClick={() => setOpen(false)}
        //   >
        //     Close
        //   </button>
        // }
      >
        <MobileNavigationMenu
          setCurrentItem={handleOnSetCurrentItem}
          status={status}
        />
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

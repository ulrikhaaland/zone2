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

interface MobileGuideViewerProps {
  status: GuideStatus;
}

// Add this method inside your Guide component
const MobileGuideViewer: React.FC<MobileGuideViewerProps> = ({ status }) => {
  const { guideStore } = useStore();
  const { guideItems, guideItemsCount } = guideStore;
  const [currentItem, setCurrentItem] = React.useState<GuideItem>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(true);

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
        open={isOpen}
        onDismiss={() => setOpen(false)}
        snapPoints={({ minHeight, maxHeight }) => [minHeight, maxHeight]}
        header={<div className="text-center font-semibold text-lg">Menu</div>}
        footer={
          <button
            className="w-full p-2 text-white bg-blue-500"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        }
      >
        <MobileNavigationMenu
          setCurrentItem={handleOnSetCurrentItem}
          status={status}
        />
      </BottomSheet>

      {currentItem && (
        <div className="mx-4 justify-center text-white">
          <div
            ref={containerRef}
            className="w-full bg-black/60 px-4 rounded-lg md:border md:border-gray-700 items-center justify-center overflow-y-auto"
            style={{ height: "calc(100vh - 150px)" }}
          >
            <ul className="list-none p-0">
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

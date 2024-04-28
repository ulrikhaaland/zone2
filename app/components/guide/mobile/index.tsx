import { useStore } from "@/RootStoreProvider";
import { GuideItem } from "@/app/model/guide";
import { GuideStatus } from "@/app/model/user";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import MobileNavigationMenu from "./MobileNavigationMenu";
import GuideSection from "../GuideSection";
import MobileGuideSection from "./MobileGuideSection";

interface MobileGuideViewerProps {
  status: GuideStatus;
}

// Add this method inside your Guide component
const MobileGuideViewer: React.FC<MobileGuideViewerProps> = ({ status }) => {
  const { guideStore } = useStore();
  const { guideItems, guideItemsCount } = guideStore;
  const [currentItem, setCurrentItem] = React.useState<GuideItem>();

  useEffect(() => {
    if (currentItem) currentItem.expanded = true;
  }, [currentItem]);

  if (status === GuideStatus.LOADING || !currentItem) {
    return (
      <MobileNavigationMenu setCurrentItem={setCurrentItem} status={status} />
    );
  }

  return (
    <div className="mx-4 justify-center text-white">
      {/* Title */}
      {/* <h2
        className={`${"text-3xl"} text-center font-semibold text-white mb-4`}
        style={{ textShadow: "10px 10px 10px rgba(0,0,0,1)" }}
      >
        {currentItem.title}
      </h2> */}
      {/* Text Container */}
      <div
        className="w-full bg-black/60 px-4 rounded-lg md:border md:border-gray-700
                items-center justify-center overflow-y-auto"
        style={{
          height: "calc(100dvh - 150px)",
        }}
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
  );
};

export default observer(MobileGuideViewer);

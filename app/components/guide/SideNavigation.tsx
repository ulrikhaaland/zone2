import { useStore } from "@/RootStoreProvider";
import { GuideItem } from "@/app/model/guide";
import { GuideStatus } from "@/app/model/user";
import { observer } from "mobx-react";
import React from "react";
import { shimmerItems } from "./skeleton";

interface SideNavigationProps {
  scrollToItem: (item: GuideItem) => void;
  status: GuideStatus;
}

// Add this method inside your Guide component
const GuideSideNavigation: React.FC<SideNavigationProps> = ({
  scrollToItem,
  status,
}) => {
  const { guideStore } = useStore();
  const { guideItems, guideItemsCount } = guideStore;

  return (
    <nav className="hidden md:block w-64 flex-shrink-0 overflow-y-auto h-full">
      <ul className="list-none p-0">
        {guideItems.map((item) => (
          <li key={item.id} className="text-gray-300 cursor-pointer p-2">
            <span
              className="hover:text-white"
              onClick={() => scrollToItem(item)}
            >
              {item.title}
            </span>
            {item.subItems && (
              <ul className="list-none p-0 pl-4 border-l border-gray-700">
                {item.subItems.map((subItem) => (
                  <li
                    key={subItem.id}
                    className="text-gray-300 hover:text-white cursor-pointer p-2"
                  >
                    <span onClick={() => scrollToItem(subItem)}>
                      {subItem.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {status === GuideStatus.LOADING && (
        <div role="status" className="max-w mb-12 pl-2">
          {shimmerItems.slice(guideItemsCount, 30).map((item, index) => (
            <div key={index}>{item}</div>
          ))}
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </nav>
  );
};

export default observer(GuideSideNavigation);

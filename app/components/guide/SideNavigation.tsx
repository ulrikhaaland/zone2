import { useStore } from "@/RootStoreProvider";
import { GuideItem } from "@/app/model/guide";
import { observer } from "mobx-react";
import React from "react";

interface SideNavigationProps {
  scrollToItem: (item: GuideItem) => void;
}

// Add this method inside your Guide component
const GuideSideNavigation: React.FC<SideNavigationProps> = ({
  scrollToItem,
}) => {
  const { guideStore } = useStore();
  const { guideItems } = guideStore;

  return (
    <nav className="hidden md:block w-64 flex-shrink-0 overflow-y-auto h-[72.5dvh]">
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
    </nav>
  );
};

export default observer(GuideSideNavigation);

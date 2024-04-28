import React, { useEffect } from "react";
import { GuideItem } from "@/app/model/guide";
import VideoIcon from "@mui/icons-material/YouTube";
import { observer } from "mobx-react";

interface GuideSectionProps {
  item: GuideItem;
  isSubItem?: boolean;
  isLast?: boolean;
  onExpand?: (item: GuideItem) => void;
  onCollapse?: (item: GuideItem) => void;
}

const GuideSection: React.FC<GuideSectionProps> = ({
  item,
  isSubItem,
  isLast,
  onExpand,
  onCollapse,
}) => {
  const [expanded, setExpanded] = React.useState(item.expanded);

  const hasSubItems = item.subItems && item.subItems.length > 0;

  useEffect(() => {
    setExpanded(item.expanded);
  }, [item.expanded]);

  // Adjusted toggle function to prevent sub-subitems from toggling their expanded state
  const handleToggleExpand = () => {
    if (!expanded) {
      onExpand?.(item); // Trigger the callback only when expanding
    } else {
      onCollapse?.(item);
    }

    if (!isSubItem) {
      // Allow only top-level items to toggle
      const newExpandedState = !expanded;
      setExpanded(newExpandedState);
      item.expanded = newExpandedState;
      item.subItems?.forEach(
        (subItem) => (subItem.expanded = newExpandedState)
      );
    }
  };

  // Conditional class to apply the left border directly to the child container
  const childContainerClass = isSubItem
    ? "border-l-2 border-gray-700 pl-4 mt-2"
    : "";

  return (
    <li
      id={`guide-item-${item.id}`}
      className={`mb-0 last:pb-4 ${
        isSubItem || isLast ? "" : "border-b border-gray-700"
      }
      ${isSubItem && isLast ? "mb-2" : ""}`}
    >
      <div
        className={`flex justify-between items-start cursor-pointer ${
          isSubItem ? "py-2" : "py-4"
        }`}
        onClick={handleToggleExpand}
      >
        <h2
          className={`${
            isSubItem ? "text-lg" : "text-2xl"
          } font-semibold text-white`}
        >
          {item.title}
        </h2>
      </div>

      <>
        {!item.videoLink ? (
          <>
            <p className={`${isSubItem ? "text-m" : "text-lg"} mb-2`}>
              {item.explanation.replace(/\【\d+†source】/g, "").trim()}
            </p>
            {hasSubItems && (
              <div className={childContainerClass}>
                <ul className="list-none">
                  {item.subItems?.map((subItem, index) => (
                    <GuideSection
                      key={subItem.id}
                      item={{ ...subItem, expanded: true }}
                      isSubItem={true}
                      isLast={isLast && index === item.subItems!.length - 1}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <button
            className={`flex items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
              // "bg-whitebg text-black border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-300"
              "bg-black text-whitebg border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-900"
            }`}
            type="button"
            onClick={() => window.open(item.videoLink, "_blank")}
          >
            <VideoIcon className="mr-2" style={{ color: "white" }} />
            Click To Watch Video
          </button>
        )}
      </>
    </li>
  );
};

export default observer(GuideSection);

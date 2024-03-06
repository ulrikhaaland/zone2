import React, { useEffect } from "react";
import { BlogItem } from "@/app/model/blog";
import { observer } from "mobx-react";

interface BlogSectionProps {
  item: BlogItem;
  isSubItem?: boolean;
  isLast?: boolean;
  onExpand?: (item: BlogItem) => void;
  onCollapse?: (item: BlogItem) => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({
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
      className={`mb-0 last:mb-2 ${
        isSubItem || isLast ? "" : "border-b border-gray-700"
      }`}
    >
      <div
        className={`flex justify-between items-start cursor-pointer ${
          isSubItem ? "py-2" : "py-4"
        }`}
        onClick={handleToggleExpand}
      >
        <h2
          className={`${
            isSubItem ? "text-lg" : "text-xl"
          } font-semibold text-white`}
        >
          {item.title}
        </h2>
        {!isSubItem && (
          <svg
            className={`w-6 h-6 transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        )}
      </div>
      {expanded && (
        <>
          <p className={`${isSubItem ? "text-sm" : "text-base"} mb-2`}>
            {item.explanation.replace(/\【\d+†source】/g, "").trim()}
          </p>
          {hasSubItems && (
            <div className={childContainerClass}>
              <ul className="list-none">
                {item.subItems?.map((subItem) => (
                  <BlogSection
                    key={subItem.id}
                    item={{ ...subItem, expanded: true }}
                    isSubItem={true}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </li>
  );
};

export default observer(BlogSection);

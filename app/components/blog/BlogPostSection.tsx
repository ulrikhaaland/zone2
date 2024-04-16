import React, { useEffect } from "react";
import { BlogItem } from "@/app/model/blog";
import { observer } from "mobx-react";

interface BlogPostSectionProps {
  item: BlogItem;
  isSubItem?: boolean;
  isLast?: boolean;
}

const BlogPostSection: React.FC<BlogPostSectionProps> = ({
  item,
  isSubItem,
  isLast,
}) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;

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
      {item.title ? (
        <div
          className={`flex justify-between items-start ${
            isSubItem ? "py-2" : "py-4"
          }`}
        >
          <h2
            className={`${
              isSubItem ? "text-lg" : "text-xl"
            } font-semibold text-white`}
          >
            {item.title}
          </h2>
          {/* {!isSubItem && (
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
          )} */}
        </div>
      ) : (
        <div className="pt-4"></div>
      )}
        <>
          {item.content.map((content, index) => (
            <p
              key={index}
              className={`${index > 0 ? "mt-4" : ""} text-base mb-2`}
            >
              {content.replace(/\【\d+†source】/g, "").trim()}
            </p>
          ))}

          {hasSubItems && (
            <div className={childContainerClass}>
              <ul className="list-none">
                {item.subItems?.map((subItem) => (
                  <BlogPostSection
                    key={subItem.id}
                    item={{ ...subItem, expanded: true }}
                    isSubItem={true}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
    </li>
  );
};

export default observer(BlogPostSection);

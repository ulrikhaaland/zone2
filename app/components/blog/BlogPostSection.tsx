import React from "react";
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

  const childContainerClass = isSubItem
    ? "border-l-2 border-gray-700 pl-4 mt-2"
    : "";

  const formatText = (text: string) => {
    // Regex to match any sequence of characters ending with a colon
    const regex = /[^:]+:/g;
    const parts = text.split(regex);
    const matches = text.match(regex) || [];

    return parts.reduce<(string | JSX.Element)[]>((acc, part, index) => {
      const prevMatch = matches[index - 1];

      // This check ensures that we do not render undefined as a strong tag
      if (prevMatch && index > 0) {
        return [...acc, <strong key={index - 1}>{prevMatch}</strong>, part];
      }
      return [...acc, part];
    }, []);
  };

  return (
    <li
      id={`guide-item-${item.id}`}
      className={`mb-0 last:mb-2 ${
        isSubItem || isLast ? "" : "border-b border-gray-700"
      }`}
    >
      {item.title && (
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
        </div>
      )}
      <>
        {item.content.map((content, index) => (
          <p
            key={index}
            className={`${
              index > 0 || !item.title ? "mt-4" : ""
            } text-base mb-2`}
          >
            {formatText(content.replace(/\【\d+†source】/g, "").trim())}
          </p>
        ))}

        {hasSubItems && (
          <div className={childContainerClass}>
            <ul className="list-none">
              {item.subItems?.map((subItem) => (
                <BlogPostSection
                  key={subItem.id}
                  item={{ ...subItem }}
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

import React from "react";
import { GuideItem } from "@/app/model/guide";

interface GuideSectionProps {
  item: GuideItem;
}

function GuideSection({ item }: GuideSectionProps) {
  const isNote = item.title.toLowerCase() === "note";
  const hasOnlyNoteSubItems = item.subItems?.every(
    (subItem) => subItem.title.toLowerCase() === "note"
  );

  return (
    <li
      className={`mb-4 last:mb-0 ${
        isNote ? "bg-secondary-button p-2 opacity-70" : ""
      }`}
    >
      <h2
        className={`text-xl font-semibold ${
          isNote ? "text-title2" : "text-title"
        }`}
      >
        {item.title}
      </h2>
      <p
        className={`mt-2 ${
          isNote ? "text-sm text-subtitle" : "text-base text-gray-700"
        }`}
      >
        {item.explanation.replace(/\【\d+†source】/g, "").trim()}
      </p>
      {item.subItems && item.subItems.length > 0 && (
        <ul
          className={`list-none p-0 ml-4 mt-4 ${
            !hasOnlyNoteSubItems ? "bg-secondary-bg p-4" : ""
          }`}
        >
          {item.subItems.map((subItem) => (
            // Apply margin to subitems, and background only if not all subitems are notes
            <div key={subItem.id} className="mt-2">
              <GuideSection item={subItem} />
            </div>
          ))}
        </ul>
      )}
    </li>
  );
}

export default GuideSection;

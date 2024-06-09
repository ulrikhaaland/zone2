import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/RootStoreProvider";
import { HeartRateZone } from "@/app/utils/HRZonesCalculator";
import HeartRateZoneItem from "./heart_rate_zone_item";

interface HeartRateZonesProps {
  zones: HeartRateZone[];
}

export default function HeartRateZones(props: HeartRateZonesProps) {
  const { zones } = props;
  const { generalStore } = useStore();
  const { isMobileView } = generalStore;

  const containerRef = useRef<HTMLDivElement>(null); // Add this line

  const [expandedZoneIndex, setExpandedItemIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (expandedZoneIndex !== null && containerRef.current) {
      const itemElement = document.getElementById(
        `heart-rate-zone-item-${expandedZoneIndex}`
      );
      if (itemElement) {
        // Calculate the top offset of the item relative to the container
        const itemOffsetTop = itemElement.offsetTop;
        // Scroll the container to bring the item to the top
        containerRef.current.scrollTo({
          top: itemOffsetTop,
          behavior: "smooth",
        });
      }
    }
  }, [expandedZoneIndex]);

  const handleExpand = (index: number) => {
    setExpandedItemIndex(index);
  };

  return (
    <div
      className={`md:max-h-[78.5dvh] 
      justify-center items-center relative w-[850px] 
      inset-0 bg-black bg-opacity-60 rounded-lg md:border md:border-gray-700
      ${isMobileView && "mx-0"}`}
    >
      <div
        className="px-4 h-full overflow-y-auto max-w-[850px] mx-auto text-whitebg custom-scrollbar"
        ref={containerRef}
        style={{
          height: isMobileView ? "calc(100dvh - 150px)" : "",
        }}
      >
        <ul className="list-none p-0">
          {zones.map((zone, index) => (
            <HeartRateZoneItem
              key={index}
              index={index}
              zone={zone}
              isLast={index === zones.length - 1}
              onExpand={() => handleExpand(index)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

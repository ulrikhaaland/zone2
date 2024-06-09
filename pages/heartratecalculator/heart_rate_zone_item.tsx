import React from "react";
import { useStore } from "@/RootStoreProvider";
import { HeartRateZone } from "@/app/utils/HRZonesCalculator";
import { Divider } from "@mui/material";

interface HeartRateZoneItemProps {
  zone: HeartRateZone;
  index: number;
  isLast?: boolean;
  onExpand: (zone: HeartRateZone) => void;
}

const HeartRateZoneItem: React.FC<HeartRateZoneItemProps> = ({
  zone,
  isLast,
  onExpand,
  index,
}) => {
  const { generalStore } = useStore();
  const { isMobileView } = generalStore;
  const [expanded, setExpanded] = React.useState(
    isMobileView ? zone.expanded : true
  );

  // Adjusted toggle function to prevent sub-subitems from toggling their expanded state
  const handleToggleExpand = () => {
    if (!expanded) {
      onExpand?.(zone); // Trigger the callback only when expanding
    }

    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    zone.expanded = newExpandedState;
  };

  const getTitle = (): string => {
    return index === 0
      ? ` (Up to ${zone.upperLimit} BPM)`
      : ` (${zone.lowerLimit} - ${zone.upperLimit} BPM)`;
  };

  return (
    <li
      id={`heart-rate-zone-item-${index}`}
      className="mb-0 last:mb-2"
      style={{
        textShadow: "10px 10px 10px rgba(0,0,0,1)",
      }}
    >
      <div
        className="flex justify-between items-start cursor-pointer py-4"
        onClick={handleToggleExpand}
      >
        <h2 className="text-xl font-semibold text-white">
          {zone.description.title + getTitle()}
        </h2>

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
      </div>
      {expanded && (
        <div className="pb-4">
          <div className={`${isMobileView ? "" : "flex"} items-center mb-1`}>
            <p className="text-sm font-bold">Characteristics:</p>
            <p className={`text-sm ${isMobileView ? "" : "ml-1"}`}>
              {zone.description.characteristics}
            </p>
          </div>
          <div className={`${isMobileView ? "" : "flex"} items-center mb-1`}>
            <p className="text-sm font-bold">Energy Source:</p>
            <p className={`text-sm ${isMobileView ? "" : "ml-1"}`}>
              {zone.description.energySource}
            </p>
          </div>
          <div className={`${isMobileView ? "" : "flex"} items-center mb-1`}>
            <p className="text-sm font-bold">Muscle Fiber:</p>
            <p className={`text-sm ${isMobileView ? "" : "ml-1"}`}>
              {zone.description.muscleFiberType}
            </p>
          </div>
          <div className={`${isMobileView ? "" : "flex"} items-center mb-1`}>
            <p className="text-sm font-bold">Benefits:</p>
            <p className={`text-sm ${isMobileView ? "" : "ml-1"}`}>
              {zone.description.benefits}
            </p>
          </div>
          <div className={`${isMobileView ? "" : "flex"} items-center mb-1`}>
            <p className="text-sm font-bold">Example:</p>
            <p className={`text-sm ${isMobileView ? "" : "ml-1"}`}>
              {zone.description.example}
            </p>
          </div>
        </div>
      )}
      {/* create divider */}
      {!isLast && (
        <Divider
          variant="fullWidth"
          sx={{
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderWidth: "1px",
          }}
        />
      )}
    </li>
  );
};

export default HeartRateZoneItem;

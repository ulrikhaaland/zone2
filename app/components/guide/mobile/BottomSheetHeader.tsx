import { GuideItem } from "@/app/model/guide";
import { GuideStatus } from "@/app/model/user";
import { observer } from "mobx-react";
import React from "react";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Loading from "../../loading";
import { IconButton } from "@mui/material";
import { on } from "events";

interface BottomSheetHeaderProps {
  status: GuideStatus;
  setCurrentItem: (item: GuideItem) => void;
  onExpand: (expanded: boolean) => void;
  expanded: boolean;
  currentItem?: GuideItem;
  previousItem?: GuideItem;
  nextItem?: GuideItem;
}

// Add this method inside your Guide component
const BottomSheetHeader: React.FC<BottomSheetHeaderProps> = ({
  status,
  setCurrentItem,
  onExpand,
  expanded,
  currentItem,
  previousItem,
  nextItem,
}) => {
  if (status === GuideStatus.LOADING && !nextItem && !previousItem)
    return (
      <div className="h-[82px] w-full">
        <h1
          className="text-2xl text-whitebg text-center font-bold relative z-10 animate-pulse"
          style={{
            textShadow: "10px 10px 10px rgba(0,0,0,1)",
          }}
        >
          Generating Guide...
        </h1>

        <div
          className={
            "text-center text-gray-300 items-center justify-center px-16 w-full text-sm pt-2 mb-4 relative z-10"
          }
          style={{
            textShadow: "10px 10px 10px rgba(0,0,0,1)",
          }}
        >
          <p>
            This will take a few minutes — feel free to wait or come back
            later...
          </p>
        </div>
      </div>
    );
  return (
    <div className="h-full w-full">
      <div className="w-full h-full justify-between">
        <div>
          <div className="flex w-full h-full items-center justify-between">
            <button
              className="w-[40%] h-[50px] flex items-center justify-start text-sm"
              onClick={() => setCurrentItem(previousItem!)}
              disabled={!previousItem}
            >
              {previousItem && (
                <>
                  <NavigateBeforeIcon fontSize="medium"/>
                  <p> {previousItem?.title}</p>
                </>
              )}
            </button>
            <div onClick={() => onExpand(!expanded)}>
              {status === GuideStatus.LOADING ? (
                <Loading size={8} />
              ) : (
                <svg
                  className={`w-8 h-8 transform ${
                    !expanded ? "rotate-180" : ""
                  }`}
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
            <button
              className="w-[40%] h-[50px] flex items-center justify-end text-sm"
              onClick={() => setCurrentItem(nextItem!)}
              disabled={!nextItem}
            >
              {nextItem && (
                <>
                  <p> {nextItem?.title}</p> <NavigateNextIcon fontSize="medium"  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(BottomSheetHeader);

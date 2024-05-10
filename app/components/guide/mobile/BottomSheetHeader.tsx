import { GuideItem } from "@/app/model/guide";
import { GuideStatus, User } from "@/app/model/user";
import { observer } from "mobx-react";
import React from "react";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { useStore } from "@/RootStoreProvider";
import Loading from "../../loading";

interface BottomSheetHeaderProps {
  status: GuideStatus;
  setCurrentItem: (item: GuideItem) => void;
  onExpand: (expanded: boolean) => void;
  expanded: boolean;
  previousItem?: GuideItem;
  nextItem?: GuideItem;
  onProvideFeedback: () => void;
  feedbackExpanded: boolean;
}

// Add this method inside your Guide component
const BottomSheetHeader: React.FC<BottomSheetHeaderProps> = ({
  status,
  setCurrentItem,
  onExpand,
  expanded,
  previousItem,
  nextItem,
  onProvideFeedback,
  feedbackExpanded,
}) => {
  const { user } = useStore().authStore;
  const isLast = !nextItem && status === GuideStatus.LOADED;

  const [showReview, setShowReview] = React.useState<boolean>(
    isLast && !user?.hasReviewed && !feedbackExpanded
  );

  const nextDisabled = !nextItem && !showReview;

  React.useEffect(() => {
    if (isLast && !user?.hasReviewed && !feedbackExpanded) {
      setShowReview(true);
    } else {
      setShowReview(false);
    }
  }, [isLast, user?.hasReviewed, feedbackExpanded]);

  if (status === GuideStatus.LOADING && !nextItem && !previousItem)
    return (
      <div className="h-max w-full z-100">
        <h1 className="text-2xl text-whitebg text-center font-bold relative z-10 animate-pulse">
          Generating Guide...
        </h1>

        <div
          className={
            "text-center text-gray-300 items-center justify-center px-16 w-full text-sm pt-2 relative z-10"
          }
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
      <div className="w-full h-full flex-nowrap">
        <div>
          <div className="flex w-full h-full overflow-hidden items-center justify-between">
            <button
              className="w-[40%] h-[50px] flex items-center justify-start text-sm"
              onClick={() => setCurrentItem(previousItem!)}
              disabled={!previousItem}
            >
              {previousItem && (
                <>
                  <NavigateBeforeIcon fontSize="medium" />
                  <p> {previousItem?.title}</p>
                </>
              )}
            </button>
            <div onClick={() => onExpand(!expanded)}>
              {/* {status === GuideStatus.LOADING ? (
                <Loading size={8} />
              ) : ( */}
              <svg
                className={`w-8 h-8 transform ${!expanded ? "rotate-180" : ""}`}
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
            <button
              className={`w-[40%] h-[50px] flex items-center justify-end text-sm
              ${
                nextDisabled && status === GuideStatus.LOADING
                  ? "justify-center"
                  : "justify-end"
              }`}
              onClick={() => {
                if (!nextItem) {
                  onProvideFeedback();
                } else {
                  setCurrentItem(nextItem!);
                }
              }}
              disabled={nextDisabled}
            >
              {!nextDisabled ? (
                <>
                  <p> {isLast ? "Provide Feedback" : nextItem?.title}</p>
                  <NavigateNextIcon fontSize="medium" />
                </>
              ) : (
                status === GuideStatus.LOADING && <Loading size={8} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(BottomSheetHeader);

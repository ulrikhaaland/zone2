import { GuideItem } from "@/app/model/guide";
import { GuideStatus } from "@/app/model/user";
import React from "react";
import FeedbackFAB from "../../feedback";
import MobileGuideSection from "./MobileGuideSection";
import { Create as CreateIcon } from "@mui/icons-material";
import { Replay as ReplayIcon } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";

interface GuideMobileContentProps {
  feedbackExpanded: boolean;
  setFeedbackExpanded: (expanded: boolean) => void;
  currentItem: GuideItem | undefined;
  containerRef: React.RefObject<HTMLDivElement>;
  status: GuideStatus;
  generateGuide: () => void;
}

// Add this method inside your Guide component
const GuideMobileContent: React.FC<GuideMobileContentProps> = ({
  feedbackExpanded,
  setFeedbackExpanded,
  currentItem,
  containerRef,
  status,
  generateGuide,
}) => {
  const { user } = useStore().authStore;
  const router = useRouter();

  if (status === GuideStatus.LOADING || status === GuideStatus.LOADED) {
    if (feedbackExpanded) {
      return <FeedbackFAB onExpand={() => setFeedbackExpanded(false)} />;
    } else {
      return (
        currentItem && (
          <div className="justify-center text-bgwhite">
            <div
              key={currentItem.id + "container"}
              ref={containerRef}
              className="w-full px-4 rounded-lg md:border md:border-gray-700 items-center justify-center overflow-y-auto"
              style={{ height: "calc(100dvh - 150px)" }}
            >
              <ul className="list-none p-0 pb-12">
                <MobileGuideSection
                  key={currentItem.id}
                  item={currentItem}
                  isSubItem={false}
                  isLast={true}
                />
              </ul>
            </div>
          </div>
        )
      );
    }
  } else if (status === GuideStatus.NONE) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ height: "calc(100dvh - 150px)" }}
      >
        <button
          className="flex justify-center items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out bg-whitebg text-black border border-gray-700"
          onClick={() => {
            router.push("/create");
          }}
        >
          <CreateIcon className="mr-2" style={{ color: "black" }} />
          Create your guide
        </button>
      </div>
    );
  } else {
    return (
      <div
        className="flex flex-col justify-center items-center"
        style={{ height: "calc(100dvh - 150px)" }}
      >
        <p className="text-whitebg text-center mb-4">
          There was an error creating your guide. Please try again.
        </p>
        <button
          className="flex justify-center items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out bg-whitebg text-black border border-gray-700"
          onClick={() => generateGuide()}
          disabled={user !== undefined && user!.retries! >= 5}
        >
          <ReplayIcon className="mr-2" style={{ color: "black" }} />
          Retry
        </button>
      </div>
    );
  }
};

export default GuideMobileContent;

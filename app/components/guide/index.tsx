import React, { useEffect, useRef, useState } from "react";
import { GuideStatus, User } from "../../model/user";
import { GuideItem } from "../../model/guide";
import GuideSection from "./GuideSection";
import "./styles.css";
import { GuideSkeletonDesktop, GuideSkeletonMobile } from "./skeleton";
import { Create as CreateIcon } from "@mui/icons-material";
import { Replay as ReplayIcon } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";
import { handleOnGenerateGuide } from "@/pages/api/generate";
import { questToFitnessData } from "@/app/model/questionaire";

interface GuideProps {
  guideItems?: GuideItem[];
  status: GuideStatus;
}

export default function Guide(props: GuideProps) {
  const { generalStore, authStore } = useStore();
  const { isMobileView } = generalStore;
  const { user } = authStore;

  const router = useRouter();

  const [guideItems, setGuideItems] = useState<GuideItem[]>(
    props.guideItems || []
  );
  const [status, setStatus] = useState(GuideStatus.LOADING);

  const containerRef = useRef<HTMLDivElement>(null); // Add this line

  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  useEffect(() => {
    if (expandedItemId !== null && containerRef.current) {
      const itemElement = document.getElementById(
        `guide-item-${expandedItemId}`
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
  }, [expandedItemId]);
  const handleExpand = (item: GuideItem) => {
    setExpandedItemId(item.id);
  };

  const generateGuide = async () => {
    setStatus(GuideStatus.LOADING);
    const user: User = {
      ...authStore.user!,
      guideStatus: GuideStatus.LOADING,
      retries: (authStore.user?.retries ?? 0) + 1,
    };

    authStore.updateUserData(user).then(() => {
      const fitnessData = questToFitnessData(user!.questions);
      fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fitnessData: fitnessData,
          uid: user!.uid,
        }),
      });
    });
  };

  const renderGuideItems = (items: GuideItem[]) => (
    <ul className="list-none p-0">
      {items.map((item, index) => (
        <GuideSection
          key={item.id}
          item={item}
          isSubItem={false}
          isLast={index === items.length - 1}
          onExpand={handleExpand}
        />
      ))}
    </ul>
  );

  const getContent = (): React.JSX.Element => {
    switch (status) {
      case GuideStatus.NONE:
        return (
          <div className="flex justify-center items-center h-full">
            <button
              className="flex justify-center items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out bg-whitebg text-black border border-gray-700"
              onClick={() => {
                router.push("/guide");
              }}
            >
              <CreateIcon className="mr-2" style={{ color: "black" }} />
              Create your guide
            </button>
          </div>
        );
      case GuideStatus.LOADED:
        return renderGuideItems(guideItems);
      case GuideStatus.LOADING:
        // Return skeleton loader
        return isMobileView ? (
          <GuideSkeletonMobile />
        ) : (
          <GuideSkeletonDesktop />
        );
      case GuideStatus.ERROR:
        return (
          <div className="flex flex-col justify-center items-center h-full">
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
      default:
        return isMobileView ? (
          <GuideSkeletonMobile />
        ) : (
          <GuideSkeletonDesktop />
        );
    }
  };

  return (
    <div
      className={`md:min-h-[72.5dvh] md:max-h-[72.5dvh] 
      justify-center items-center min-h-screen relative w-[850px] 
      inset-0 bg-black bg-opacity-60 rounded-lg md:border md:border-gray-700
      ${isMobileView && "mx-4"}`}
    >
      <div
        className="p-4 h-full overflow-y-auto max-w-[850px] mx-auto text-whitebg custom-scrollbar"
        ref={containerRef}
        style={{
          height: isMobileView ? "calc(100dvh - 150px)" : "",
        }}
      >
        {getContent()}
      </div>
    </div>
  );
}

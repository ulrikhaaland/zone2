import React, { useEffect, useState } from "react";
import { GuideStatus } from "../../model/user";
import { GuideItem } from "../../model/guide";
import GuideSection from "./GuideSection";
import "./styles.css";
import { GuideSkeleton } from "./skeleton";
import { Create as CreateIcon } from "@mui/icons-material";
import { useRouter } from "next/router";

interface GuideProps {
  guideItems?: GuideItem[];
  status: GuideStatus;
}

export default function Guide(props: GuideProps) {
  const router = useRouter();

  const [guideItems, setGuideItems] = useState<GuideItem[]>(
    props.guideItems || []
  );
  const [status, setStatus] = useState(props.status);

  const renderGuideItems = (items: GuideItem[]) => (
    <ul className="list-none p-0">
      {items.map((item) => (
        <GuideSection key={item.id} item={item} />
      ))}
    </ul>
  );

  const getContent = (): React.JSX.Element => {
    switch (status) {
      case GuideStatus.NONE:
        return (
          <div className="flex justify-center items-center h-full">
            <button
              className="flex justify-center items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out bg-white text-black border border-gray-700"
              onClick={() => {
                router.push("/zone2guide");
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
        return <GuideSkeleton />;
      case GuideStatus.ERROR:
        return <p className="text-center">Error generating guide</p>;
      default:
        return <GuideSkeleton />; // Fallback or initial loading state
    }
  };

  return (
    <div
      className="md:min-h-[72.5dvh] min-h-[50.5dvh] md:max-h-[72.5dvh] max-h-[50.5dvh] 
      justify-center items-center min-h-screen relative w-[850px] 
        inset-0 bg-black bg-opacity-60 rounded-lg border border-gray-700"
    >
      <div className="p-4 h-full overflow-y-auto max-w-[850px] mx-auto text-white custom-scrollbar">
        {getContent()}
      </div>
    </div>
  );
}

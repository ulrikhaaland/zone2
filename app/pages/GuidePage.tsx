import React, { useEffect, useState } from "react";
import { GuideStatus } from "../model/user";
import { GuideItem } from "../model/guide";
import GuideSection from "../components/guide/GuideSection";
import "./styles.css";

interface GuideProps {
  guideItems?: GuideItem[];
  status: GuideStatus;
}

export default function Guide(props: GuideProps) {
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
      case GuideStatus.LOADED:
        return renderGuideItems(guideItems);
      case GuideStatus.LOADING:
        return <p className="text-center">Loading guide...</p>;
      case GuideStatus.ERROR:
        return <p className="text-center">Error generating guide</p>;
      default:
      case GuideStatus.LOADING:
        return <p className="text-center">Loading guide...</p>;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen absolute inset-0 bg-black bg-opacity-60 rounded-lg overflow-hidden">
      <div
        className="scrollable-container p-4 overflow-y-auto w-[850px] mx-auto text-white"
        style={{
          height: "calc(100vh - 2rem)",
          maxHeight: "calc(100vh - 2rem)",
        }}
      >
        {getContent()}
      </div>
    </div>
  );
}

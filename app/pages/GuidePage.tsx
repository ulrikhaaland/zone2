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
    <div className="absolute top-0 left-0 w-full h-fit text-white overflow-hidden">
      <div className="scrollable-container max-w-4xl mx-auto p-4 h-[calc(100vh-8rem)] overflow-auto">
        <h1 className="text-3xl text-center font-bold mb-6">
          Your Personalized Fitness Guide
        </h1>
        {getContent()}
      </div>
    </div>
  );
}

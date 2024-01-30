import React, { useEffect, useState } from "react";
import { FitnessData } from "../model/user";
import { generateGuide } from "../utils/openAI";
import { GuideItem, parseJsonToGuideItems } from "../model/guide";
import GuideSection from "../components/guide/GuideSection";

interface GuideProps {
  fitnessData: FitnessData;
  guideItems?: GuideItem[];
  onLoadGuideItems: (items: GuideItem[]) => void;
}

export default function Guide(props: GuideProps) {
  const { fitnessData, onLoadGuideItems } = props;
  const [guideItems, setGuideItems] = useState<GuideItem[]>(
    props.guideItems || []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guideItems.length === 0 && !loading) {
      setLoading(true);
      generateGuide(fitnessData).then((guide) => {
        const items = parseJsonToGuideItems(guide!);
        setGuideItems(items);
        onLoadGuideItems(items);
        setLoading(false);
      });
    }
  }, [guideItems.length, loading, fitnessData]);

  const renderGuideItems = (items: GuideItem[]) => (
    <ul className="list-none p-0 bg-primary-bg">
      {items.map((item) => (
        <GuideSection key={item.id} item={item} />
      ))}
    </ul>
  );

  return (
    <div className="absolute top-0 left-0 w-full h-fit bg-primary-bg">
      <div className="max-w-4xl mx-auto p-4 h-max bg-primary-bg">
        <h1 className="text-3xl text-center font-bold text-title mb-6">
          Your Personalized Fitness Guide
        </h1>
        {loading ? (
          <p className="text-center text-gray-600">Loading guide...</p>
        ) : (
          renderGuideItems(guideItems)
        )}
      </div>
    </div>
  );
}

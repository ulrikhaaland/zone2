import BlogPostScaffold from "@/app/components/blog/BlogPostScaffold";
import { BlogPost, BlogItem } from "@/app/model/blog";
import { NextPageWithLayout } from "@/pages/_app";
import { ReactElement } from "react";

const items: BlogItem[] = [
  {
    id: 1,
    title: "The Significance of Resting Heart Rate",
    content: [
      "Resting Heart Rate (RHR) is a crucial indicator of cardiovascular health and fitness. A normal RHR ranges between 60 to 100 bpm for adults, with lower rates often observed in physically active individuals. Understanding your RHR can help you monitor your heart's health and efficiency.",
    ],
    expanded: true,
  },
  {
    id: 2,
    title: "Accurate Measurement of RHR with Equipment",
    content: [
      "Measuring your RHR accurately requires the use of specific equipment, such as smartwatches and heart rate belts. Each method has its own set of guidelines to ensure precision in tracking your heart rate.",
    ],
    expanded: true,
    subItems: [
      {
        id: 3,
        title: "Utilizing Smartwatches",
        content: [
          "Smartwatches use optical sensors to measure RHR through the skin. For accurate readings, ensure a snug fit, measure after waking up, keep conditions consistent, adjust device settings for continuous monitoring, and interpret data trends over time.",
        ],
        parentId: 2,
        expanded: true,
      },
      {
        id: 4,
        title: "Leveraging Heart Rate Belts",
        content: [
          "Heart rate belts measure RHR through electrical signals. For optimal accuracy, position the belt correctly, conduct a brief warm-up, maintain a consistent body position, use reliable equipment, and cross-check readings manually.",
        ],
        parentId: 2,
        expanded: true,
      },
    ],
  },

  {
    id: 5,
    title: "Measuring RHR Without Equipment",
    content: [
      "You can measure your RHR manually by locating your pulse on your neck or wrist, counting the beats per minute, and repeating the process for accuracy. This method requires no equipment but a consistent approach for precise results.",
    ],
    expanded: true,
  },
  {
    id: 6,
    title: "Key Considerations for All Methods",
    content: [
      "Regardless of the method used to measure RHR, avoid stimulants, ensure hydration, and engage in regular monitoring. These practices contribute to the accuracy of RHR readings and the overall understanding of your cardiovascular health.",
    ],
    expanded: true,
  },
];

const BlogPostRestingHeartRate: NextPageWithLayout = () => {
  const post: BlogPost = {
    title: "Finding Your Resting Heart Rate",
    href: "resting-heart-rate",
    imagePath: "/assets/images/runner/runner8.png",
    items: items,
    date: "2021-09-01",
    categories: ["Health"],
    description: "What is Resting Heart Rate and how to measure it?",
    readingTime: 5,
  };

  return <BlogPostScaffold post={post} />;
};

BlogPostRestingHeartRate.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default BlogPostRestingHeartRate;

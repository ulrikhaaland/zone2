import BlogPostScaffold from "@/app/components/blog/BlogPostScaffold";
import { BlogPost, BlogItem } from "@/app/model/blog";
import { NextPageWithLayout } from "@/pages/_app";
import { ReactElement } from "react";

const items: BlogItem[] = [
  {
    id: 1,
    title: "Understanding Maximum Heart Rate",
    explanation:
      "Maximum Heart Rate (MHR) is the highest heart rate an individual can achieve during Maximum physical exertion. It's a crucial metric for tailoring workout intensity and understanding cardiovascular capacity. Knowing your MHR helps in structuring training sessions to maximize efficiency and safety.",
    expanded: true,
  },
  {
    id: 2,
    title: "Methods to Determine Your Maximum Heart Rate",
    explanation:
      "There are various methods to determine MHR, including theoretical calculations and empirical testing. Each method offers different levels of accuracy and practicality, from quick estimates to detailed, personalized testing.",
    expanded: true,
    subItems: [
      {
        id: 3,
        title: "Theoretical Calculation",
        explanation:
          "Theoretical calculations provide a quick way to estimate MHR using formulas such as 220-minus-age or the Tanaka formula. While convenient, these methods may not account for individual variations and are less accurate than empirical testing.",
        parentId: 2,
        expanded: true,
        subItems: [
          {
            id: 4,
            title: "The 220-minus-age Formula",
            explanation:
              "A simple estimation of MHR is achieved by subtracting your age from 220. This method offers a general approximation but can vary significantly from actual Maximum heart rates.",
            parentId: 3,
            expanded: true,
          },
          {
            id: 5,
            title: "The Tanaka Formula",
            explanation:
              "The Tanaka formula, calculated as 208 - (0.7 × age), provides a refined estimate of MHR, offering closer approximations for a wider age range compared to the 220-minus-age formula.",
            parentId: 3,
            expanded: true,
          },
        ],
      },
      {
        id: 6,
        title: "Empirical Testing",
        explanation:
          "Empirical testing methods, including Graded Exercise Tests (GET) and field tests, measure MHR through actual physical exertion. These tests are more accurate and personalized, reflecting individual cardiovascular capacities.",
        parentId: 2,
        expanded: true,
        subItems: [
          {
            id: 7,
            title: "Graded Exercise Test (GET)",
            explanation:
              "GET involves increasing exercise intensity under professional supervision until exhaustion. It's the most accurate method to determine MHR, providing personalized results based on actual performance.",
            parentId: 6,
            expanded: true,
          },
          {
            id: 8,
            title: "Field Tests",
            explanation:
              "Field tests are practical alternatives to lab-based GET, requiring individuals to reach maximum effort during high-intensity exercises like sprinting. Using a heart rate monitor to track the peak heart rate can offer insights into MHR.",
            parentId: 6,
            expanded: true,
          },
        ],
      },
    ],
  },
  {
    id: 9,
    title: "Considerations for Accurate MHR Measurement",
    explanation:
      "Accurate MHR measurement requires attention to detail, including professional supervision for safety, understanding personal factors influencing MHR, using reliable monitoring equipment, proper warm-up, and ensuring recovery between tests for consistency.",
    expanded: true,
  },
];

const BlogPostMaximumHeartRate: NextPageWithLayout = () => {
  const post: BlogPost = {
    title: "Finding Your Maximum Heart Rate",
    href: "/blog/maximum-heart-rate",
    imagePath: "/assets/images/runner/runner8.png",
    items: items,
    date: "2021-09-01",
    category: "Health",
    description: "What is Resting Heart Rate and how to measure it?",
    readingTime: 5,
  };

  return <BlogPostScaffold post={post} />;
};

BlogPostMaximumHeartRate.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default BlogPostMaximumHeartRate;

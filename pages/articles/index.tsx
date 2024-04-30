import { ReactElement, useEffect, useRef, useState } from "react";
import { NextPageWithLayout } from "../_app";
import { useStore } from "@/RootStoreProvider";
import VideoIcon from "@mui/icons-material/YouTube";
import ArticleIcon from "@mui/icons-material/Article";
import { AnimatePresence, motion } from "framer-motion";
import VideoSection from "@/app/components/content/VideoSection";
import BlogSection from "@/app/components/content/BlogSection";
import { useRouter } from "next/router";

export const ContentPage: NextPageWithLayout = () => {
  const { generalStore, authStore } = useStore();
  const { isMobileView } = generalStore;
  const { user } = authStore;
  const [pageIndex, setPageIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const goToArticle = (path: string) => {
    if (contentRef.current) {
      sessionStorage.setItem(
        "scrollPosition",
        contentRef.current.scrollTop.toString()
      );
    }
    router.push(`articles/${path}`);
  };

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("scrollPosition") || "0";
    if (contentRef.current) {
      contentRef.current.scrollTop = parseInt(savedScrollPosition);
      sessionStorage.removeItem("scrollPosition"); // Optionally clear the storage after scroll restoration
    }
  }, [pageIndex]);

  return (
    <div className="w-full font-custom h-screen relative bg-blackbg">
      <div className="pt-24">
        {/* Button Container */}
        {/* <div className="relative flex justify-between items-center md:px-6 pt-12 md:pt-0 md-pb-0 pb-4 w-[300px] mx-auto">
          <button
            className={`flex w-[160px] items-center justify-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
              pageIndex === 0
                ? "bg-whitebg text-black border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-300"
                : "bg-black text-whitebg border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-900"
            }`}
            type="button"
            onClick={() => setPageIndex(0)}
          >
            <ArticleIcon
              className="mr-2"
              style={{ color: pageIndex === 0 ? "black" : "white" }}
            />
            Articles
          </button>
          <div
            style={{
              width: "50px",
              height: "10px",
              backgroundColor: "transparent",
            }}
          ></div>
          <button
            className={`flex w-[160px] justify-center items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
              pageIndex === 1
                ? "bg-whitebg text-black border border-transparent hover:bg-gray-300"
                : "bg-black text-whitebg border border-gray-700 hover:bg-gray-900"
            }`}
            type="submit"
            onClick={(e) => setPageIndex(1)}
          >
            <VideoIcon
              className="mr-2"
              style={{ color: pageIndex === 1 ? "black" : "white" }}
            />
            Videos
          </button>
        </div> */}
        {/* Page Content */}
        <div
          ref={contentRef}
          className="overflow-y-auto flex w-7xl md:rounded flex-col items-center min-h-max p-4 relative"
          style={{
            height: `88dvh`,
          }}
        >
          <div className="w-full relative md:shadow-md pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                className="relative z-0 flex justify-center" // Ensure content is below the overlays
                key={pageIndex}
                initial={{ opacity: 0, x: pageIndex === 0 ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: pageIndex === 0 ? -100 : 100,
                }}
                transition={{ duration: 0.25 }}
              >
                {pageIndex === 0 && (
                  <BlogSection user={user} onClickArticle={goToArticle} />
                )}
                {pageIndex === 1 && <VideoSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

ContentPage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default ContentPage;

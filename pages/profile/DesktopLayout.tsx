import React from "react";
import { GuideStatus, User } from "@/app/model/user";
import Guide from "@/app/components/guide";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { AnimatePresence, motion } from "framer-motion";
import { Question } from "@/app/model/questionaire";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FeedbackFAB from "@/app/components/feedback";

interface ProfileDesktopLayoutProps {
  pageIndex: number;
  user: User | undefined;
  guideStatus: GuideStatus | undefined;
  updateUser: (questions: Question[]) => void;
  setPageIndex: (index: number) => void;
  genGuide: () => void;
  showFeedback: boolean;
}

const ProfileDesktopLayout: React.FC<ProfileDesktopLayoutProps> = ({
  pageIndex,
  user,
  guideStatus,
  updateUser,
  setPageIndex,
  genGuide,
  showFeedback,
}) => {
  return (
    <div className="w-full font-custom h-screen overflow-hidden relative">
      {/* Background Image */}
      {/* Container for Background Image and Black Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0, // Adjust zIndex as needed
        }}
      >
        {/* Background Image */}
        <div
          style={{
            backgroundImage: "url('/assets/images/cyclist/cyclist.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        ></div>

        {/* Black Overlay with Opacity */}
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Black with 50% opacity
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        ></div>
      </div>
      <div className="pt-24"> 
        {/* If guidestatus === loading show subtitle saying this can take a few minutes */}
        {guideStatus === GuideStatus.LOADING && (
          <>
            <h1
              className={`text-5xl text-whitebg text-center font-bold md:pt-0 pt-6 mb-4 relative z-10 ${
                guideStatus === GuideStatus.LOADING && pageIndex === 0
                  ? "animate-pulse"
                  : ""
              }`}
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              {pageIndex === 1
                ? "Profile"
                : guideStatus === GuideStatus.LOADING
                ? "Generating Guide..."
                : "Your Personalized Fitness Guide"}
            </h1>
            <p
              className={`${
                pageIndex === 1 ? "text-transparent" : "text-whitebg"
              } text-center text-m mb-4 relative z-10`}
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              This will take a few minutes — feel free to wait or come back
              later...
            </p>
          </>
        )}
        {/* Button Container */}
        <div className="relative flex justify-between items-center md:px-6 pt-12 md:pt-2 md-pb-0 pb-4 w-[300px] mx-auto">
          <button
            className={`flex items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
              pageIndex === 0
                ? "bg-whitebg text-black border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-300"
                : "bg-black text-whitebg border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-900"
            }`}
            type="button"
            onClick={() => setPageIndex(0)}
          >
            <MenuBookIcon
              className="mr-2"
              style={{ color: pageIndex === 0 ? "black" : "white" }}
            />
            Guide
          </button>
          <div
            style={{
              width: "50px",
              height: "10px",
              backgroundColor: "transparent",
            }}
          ></div>
          <button
            className={`flex items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
              pageIndex === 1
                ? "bg-whitebg text-black border border-transparent hover:bg-gray-300"
                : "bg-black text-whitebg border border-gray-700 hover:bg-gray-900"
            }`}
            type="submit"
            onClick={(e) => setPageIndex(1)}
          >
            <AccountCircleIcon
              className="mr-2"
              style={{ color: pageIndex === 1 ? "black" : "white" }}
            />
            Profile
          </button>
        </div>

        {/* Page Content */}
        <div className="flex overflow-hidden md:rounded flex-col items-center min-h-max p-4 relative">
          <div className="w-full md:overflow-hidden md:shadow-md md:min-h-[83.5dvh] md:max-h-[87.5dvh] min-h-[86.5dvh] max-h-[86.5dvh]">
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
                {pageIndex === 0 && user && user.guideStatus && (
                  <Guide
                    key={guideStatus}
                    guideItems={user.guideItems}
                    status={guideStatus!}
                    generateGuide={() => genGuide()}
                  />
                )}
                {pageIndex === 1 && user && (
                  <Questionnaire
                    onQuestCompleted={(questions) => {
                      updateUser(questions);
                    }}
                    user={user}
                    questions={user.questions}
                    canSubmit={() => null}
                    isProfile={true}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {showFeedback && <FeedbackFAB />}
    </div>
  );
};

export default ProfileDesktopLayout;

import React from "react";
import { GuideStatus, User } from "@/app/model/user";
import Guide from "@/app/components/guide";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { AnimatePresence, motion } from "framer-motion";
import { Question } from "@/app/model/questionaire";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface ProfileMobileLayoutProps {
  pageIndex: number;
  user: User | undefined;
  guideStatus: GuideStatus | undefined;
  updateUser: (questions: Question[]) => void;
  setPageIndex: (index: number) => void;
}

const ProfileMobileLayout: React.FC<ProfileMobileLayoutProps> = ({
  pageIndex,
  user,
  guideStatus,
  updateUser,
  setPageIndex,
}) => {
  return (
    <div className="w-full pt-16 font-custom h-full overflow-hidden relative">
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

      {/* Button Container */}
      <div className="relative flex justify-center items-center mb-4 w-full mx-auto">
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
            width: "10px",
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
      {pageIndex === 0 && guideStatus === GuideStatus.LOADING && (
        <>
          <h1
            className={`text-3xl text-whitebg text-center font-bold relative z-10 ${
              guideStatus === GuideStatus.LOADING && pageIndex === 0
                ? "animate-pulse"
                : ""
            }`}
            style={{
              textShadow: "10px 10px 10px rgba(0,0,0,1)",
            }}
          >
            Creating Guide...
          </h1>
          {guideStatus === GuideStatus.LOADING && (
            <p
              className="text-whitebg text-center text-m mt-2 mb-2 relative z-10"
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              This can take a few minutes...
            </p>
          )}
        </>
      )}
      {/* Page Content */}
      <div className="flex flex-col items-center relative">
        <div className="w-full">
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
  );
};

export default ProfileMobileLayout;

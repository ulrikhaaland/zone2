import React from "react";
import { GuideStatus, User } from "@/app/model/user";
import Guide from "@/app/components/guide/desktop";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { AnimatePresence, motion } from "framer-motion";
import { Question } from "@/app/model/questionaire";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FeedbackFAB from "@/app/components/feedback";
import "../../app/globals.css";

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
        {/* Page Content */}
        <div className="flex overflow-hidden md:rounded flex-col items-center min-h-max p-4 relative">
          <div className="md:overflow-hidden md:shadow-md">
            <Questionnaire
              onQuestCompleted={(questions) => {
                updateUser(questions);
              }}
              user={user!}
              questions={user!.questions}
              canSubmit={() => null}
              isProfile={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDesktopLayout;

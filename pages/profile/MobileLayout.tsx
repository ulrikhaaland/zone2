import React, { useState } from "react";
import { GuideStatus, User } from "@/app/model/user";
import Guide from "@/app/components/guide/desktop";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { AnimatePresence, motion } from "framer-motion";
import { Question } from "@/app/model/questionaire";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FeedbackFAB from "@/app/components/feedback";
import { GuideItem } from "@/app/model/guide";
import MobileGuideViewer from "@/app/components/guide/mobile/index";

interface ProfileMobileLayoutProps {
  pageIndex: number;
  user: User | undefined;
  guideStatus: GuideStatus;
  updateUser: (questions: Question[]) => void;
  setPageIndex: (index: number) => void;
  genGuide: () => void;
  showFeedback: boolean;
}

const ProfileMobileLayout: React.FC<ProfileMobileLayoutProps> = ({
  pageIndex,
  user,
  guideStatus,
  updateUser,
  setPageIndex,
  genGuide,
  showFeedback,
}) => {
  const [scrolledToTopOrBottom, setScrolledToTopOrBottom] = useState(true);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);

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

      {/* Page Content */}
      <div className="flex flex-col items-center relative">
        <div className="w-full">
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
  );
};

export default ProfileMobileLayout;

import React from "react";
import { User } from "@/app/model/user";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { Question } from "@/app/model/questionaire";
import "../../app/globals.css";

interface ProfileDesktopLayoutProps {
  user: User | undefined;
  updateUser: (questions: Question[]) => void;
}

const ProfileDesktopLayout: React.FC<ProfileDesktopLayoutProps> = ({
  user,
  updateUser,
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

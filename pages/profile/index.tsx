import { ReactElement, useEffect, useState } from "react";
import { NextPageWithLayout, auth } from "../_app";
import { useStore } from "@/RootStoreProvider";
import { User } from "@/app/model/user";
import Guide from "@/app/pages/GuidePage";
import { AnimatePresence, motion } from "framer-motion";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { Question, questToFitnessData } from "@/app/model/questionaire";
import { set } from "mobx";
import { observer } from "mobx-react";
import { a } from "react-spring";

const UserProfile: NextPageWithLayout = () => {
  const { authStore } = useStore();

  const [user, setUser] = useState<User | undefined>(
    authStore.user ?? undefined
  );

  const [pageIndex, setPageIndex] = useState(0);

  // generate guide
  const [genGuide, setGenGuide] = useState(false);

  const updateUser = (questions: Question[]) => {
    setUser({ ...user!, questions: questions });
    authStore.updateUserData();
  };

  useEffect(() => {
    if (!authStore.user) {
      authStore.checkAuth();
    } else {
      console.log("user has paid: ", authStore.user);
      if (authStore.user.hasPaid && authStore.user.guideItems.length === 0) {
        console.log("setting page index to 1");
        setPageIndex(1);

        setGenGuide(true);
      }

      setUser(authStore.user);
    }
  }, [authStore, authStore.user]);

  return (
    <div className="w-full font-custom md:h-screen min-h-[100dvh] relative">
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
            backgroundImage: "url('/assets/images/runner8.png')",
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
      <h1
        className="text-5xl text-white text-center font-bold pt-6 mb-4 relative z-10"
        style={{
          textShadow: "10px 10px 10px rgba(0,0,0,1)",
        }}
      >
        Zone 2 Guide Creation
      </h1>
      <div className="flex overflow-hidden md:rounded flex-col items-center min-h-max p-4 relative">
        <div className="w-full bg-black bg-opacity-60 rounded-lg md:overflow-hidden max-w-md md:shadow-md md:min-h-[83.5dvh] md:max-h-[87.5dvh] min-h-[86.5dvh] max-h-[86.5dvh]">
          <AnimatePresence mode="wait">
            <motion.div
              className="relative z-0" // Ensure content is below the overlays
              key={pageIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: -100,
              }}
              transition={{ duration: 0.25 }}
            >
              {pageIndex === 0 && user && (
                <Questionnaire
                  onQuestCompleted={updateUser}
                  user={user}
                  questions={user.questions}
                  canSubmit={() => null}
                  isProfile={true}
                />
              )}
              {pageIndex === 1 && user && (
                <Guide
                  onLoadGuideItems={(items) =>
                    setUser({ ...user, guideItems: items })
                  }
                  guideItems={user.guideItems}
                  fitnessData={questToFitnessData(user.questions)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

UserProfile.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(UserProfile);

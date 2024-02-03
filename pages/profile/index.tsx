import { ReactElement, useEffect, useState } from "react";
import { NextPageWithLayout, auth } from "../_app";
import { useStore } from "@/RootStoreProvider";
import { GuideStatus, User } from "@/app/model/user";
import Guide from "@/app/pages/GuidePage";
import { AnimatePresence, motion } from "framer-motion";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { Question, questToFitnessData } from "@/app/model/questionaire";
import { set } from "mobx";
import { observer } from "mobx-react";
import { a } from "react-spring";
import { GuideItem } from "@/app/model/guide";

const UserProfile: NextPageWithLayout = () => {
  const { authStore } = useStore();

  const [user, setUser] = useState<User | undefined>(
    authStore.user ?? undefined
  );

  const [pageIndex, setPageIndex] = useState(1);

  const [guideStatus, setGuideStatus] = useState(user?.guideStatus);

  const updateUser = (questions: Question[]) => {
    const updatedUser = { ...user!, questions: questions };
    authStore.updateUserData(updatedUser);
  };

  useEffect(() => {
    if (!authStore.user) {
      authStore.checkAuth();
    } else {
      setUser(authStore.user);

      if (authStore.user.guideStatus === GuideStatus.LOADING) {
        setGuideStatus(authStore.user.guideStatus);
        console.log("user is in guide loading status: ", authStore.user);

        // Setup listener for guideStatus updates
        const unsubscribe = authStore.listenToUserGuideStatus(
          (newGuideStatus: GuideStatus) => {
            console.log("new guide status: ", newGuideStatus);
            if (newGuideStatus === GuideStatus.LOADED) {
              // Unsubscribe when guideStatus becomes LOADED
              console.log("Guide is loaded, unsubscribing from updates.");
              onGuideLoaded();
              if (typeof unsubscribe === "function") {
                unsubscribe();
              }
            } else {
              // Handle other guide status updates here
              authStore
                .getUserOrCreateIfNotExists(authStore.user!.uid)
                .then((updatedUser) => {
                  setGuideStatus(newGuideStatus);
                  setUser(updatedUser);
                });
            }
          }
        );

        // Cleanup function to unsubscribe, only if unsubscribe is a function
        return () => {
          if (typeof unsubscribe === "function") {
            unsubscribe();
          }
        };
      }
    }
  }, [authStore, authStore.user]);

  const onGuideLoaded = () => {
    authStore
      .getUserOrCreateIfNotExists(authStore.user!.uid)
      .then((updatedUser) => {
        setGuideStatus(GuideStatus.LOADED);
        authStore.setUser(updatedUser);
        setUser(updatedUser);
      });
  };

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
        <div className="w-full bg-black bg-opacity-60 rounded-lg md:overflow-hidden md:shadow-md md:min-h-[83.5dvh] md:max-h-[87.5dvh] min-h-[86.5dvh] max-h-[86.5dvh]">
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
                  onQuestCompleted={(questions) => {
                    updateUser(questions);
                  }}
                  user={user}
                  questions={user.questions}
                  canSubmit={() => null}
                  isProfile={true}
                />
              )}
              {pageIndex === 1 && user && user.guideStatus && (
                <Guide
                  key={guideStatus}
                  guideItems={user.guideItems}
                  status={guideStatus!}
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

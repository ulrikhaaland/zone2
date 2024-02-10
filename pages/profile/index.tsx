import { ReactElement, useEffect, useState } from "react";
import { NextPageWithLayout, auth } from "../_app";
import { useStore } from "@/RootStoreProvider";
import { GuideStatus, User } from "@/app/model/user";
import Guide from "@/app/components/guide";
import { AnimatePresence, motion } from "framer-motion";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { Question, questToFitnessData } from "@/app/model/questionaire";
import { observer } from "mobx-react";
import ProfileDesktopLayout from "./DesktopLayout";
import ProfileMobileLayout from "./MobileLayout";

const UserProfile: NextPageWithLayout = () => {
  const { authStore, generalStore } = useStore();

  const { isMobileView } = generalStore;

  const [user, setUser] = useState<User | undefined>(
    authStore.user ?? undefined
  );

  const [pageIndex, setPageIndex] = useState(0);

  const [guideStatus, setGuideStatus] = useState(user?.guideStatus);

  const updateUser = (questions: Question[]) => {
    const updatedUser = { ...user!, questions: questions };
    authStore.updateUserData(updatedUser);
  };

  useEffect(() => {
    if (!authStore.user) {
      authStore.checkAuth();
    } else {
      const user = authStore.user;
      setUser(user);
      setGuideStatus(user.guideStatus);

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
              onGuideLoaded();
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
      .getUserOrCreateIfNotExists(authStore.user!.firebaseUser!)
      .then((updatedUser) => {
        setGuideStatus(GuideStatus.LOADED);
        authStore.setUser(updatedUser);
        setUser(updatedUser);
      });
  };
  if (isMobileView) {
    return (
      <ProfileMobileLayout
        pageIndex={pageIndex}
        user={user}
        guideStatus={GuideStatus.LOADING}
        updateUser={updateUser}
        setPageIndex={setPageIndex}
      />
    );
  } else {
    return (
      <ProfileDesktopLayout
        pageIndex={pageIndex}
        user={user}
        guideStatus={guideStatus}
        updateUser={updateUser}
        setPageIndex={setPageIndex}
      />
    );
  }
};

UserProfile.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(UserProfile);

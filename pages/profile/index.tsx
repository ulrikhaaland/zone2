import { ReactElement, useEffect, useRef, useState } from "react";
import { NextPageWithLayout, auth, db } from "../_app";
import { useStore } from "@/RootStoreProvider";
import { GuideStatus, User } from "@/app/model/user";
import Guide from "@/app/components/guide";
import { AnimatePresence, motion } from "framer-motion";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";
import { Question, questToFitnessData } from "@/app/model/questionaire";
import { observer } from "mobx-react";
import ProfileDesktopLayout from "./DesktopLayout";
import ProfileMobileLayout from "./MobileLayout";
import { handleOnGenerateGuide } from "../api/generate";
import { doc, updateDoc } from "firebase/firestore";

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

  const isFetching = useRef<boolean>(false);

  useEffect(() => {
    if (!authStore.user) {
      authStore.checkAuth();
    } else if (!user) {
      console.log("user is already logged in: ", authStore.user);
      const user = authStore.user;
      setUser(user);

      if (
        user.guideStatus === GuideStatus.HASPAID &&
        user.hasPaid &&
        !isFetching.current
      ) {
        isFetching.current = true;
        authStore.setUser({ ...user, guideStatus: GuideStatus.LOADING });
        setGuideStatus(GuideStatus.LOADING);

        updateDoc(doc(db, "users", user.uid), {
          guideStatus: GuideStatus.LOADING,
        }).then(() => {
          fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fitnessData: questToFitnessData(user!.questions),
              uid: user!.uid,
            }),
          })
            .then(() => {
              isFetching.current = false;
            })
            .catch((error) => {
              console.error("Fetch error:", error);
              isFetching.current = false;
            });
        });

        console.log("user is in guide loading status: ", user);

        // Setup listener for guideStatus updates
        const unsubscribe = authStore.listenToUserGuideStatus(
          (newGuideStatus) => {
            console.log("new guide status: ", newGuideStatus);
            if (newGuideStatus === GuideStatus.LOADED) {
              console.log("Guide is loaded, unsubscribing from updates.");
              onGuideLoaded();
              unsubscribe?.();
            } else {
              onGuideLoaded();
            }
          }
        );

        // Cleanup function to unsubscribe
        return () => {
          unsubscribe?.();
        };
      } else {
        setGuideStatus(user.guideStatus);
      }
    }
  }, [authStore, authStore.user, user, isFetching]); // Note: Added isFetching to the dependencies

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
        guideStatus={guideStatus}
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

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

type RunInfo = {
  threadId: string | undefined;
  runId: string | undefined;
};

const UserProfile: NextPageWithLayout = () => {
  const { authStore, generalStore } = useStore();

  const { isMobileView } = generalStore;

  const [user, setUser] = useState<User | undefined>(
    authStore.user ?? undefined
  );
  const [runInfo, setRunInfo] = useState<RunInfo>({
    threadId: undefined,
    runId: undefined,
  });

  const [pageIndex, setPageIndex] = useState(0);

  const [guideStatus, setGuideStatus] = useState(user?.guideStatus);

  const updateUser = (questions: Question[]) => {
    const updatedUser = { ...user!, questions: questions };
    authStore.updateUserData(updatedUser);
  };

  const isFetching = useRef<boolean>(false);

  const generateGuide = (user: User) => {
    isFetching.current = true;
    user.guideStatus = GuideStatus.LOADING;
    authStore.setUser(user);
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
        .then(async () => {
          console.log("Guide generation request sent.");
          isFetching.current = false;
          const userData = await authStore.getUserOrCreateIfNotExists(
            authStore.user!.firebaseUser!
          );
          authStore.setUser(userData);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          isFetching.current = false;
        });
    });
  };

  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout | undefined;

    if (runInfo.threadId && runInfo.runId) {
      intervalId = setInterval(() => {
        checkRunStatus(runInfo.threadId!, runInfo.runId!);
      }, 5000); // Poll every 5 seconds, adjust as needed
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [runInfo]);

  const checkRunStatus = async (threadId: string, runId: string) => {
    try {
      const response = await fetch(
        `/api/check-status?threadId=${threadId}&runId=${runId}&uid=${authStore.user?.uid}`
      );
      const { status } = await response.json();
      if (status === "completed") {
        const user = await authStore.getUserOrCreateIfNotExists(
          authStore.user!.firebaseUser!
        );
        setGuideStatus(GuideStatus.LOADED);
        console.log("Guide is loaded, updating user data." + user.guideItems);
        authStore.updateUserData({
          ...user,
          guideGenerationRunId: undefined,
          guideGenerationThreadId: undefined,
        });
      } else {
        console.log("Guide generation status: ", status);
      }
    } catch (error) {
      console.error("Error checking run status:", error);
    }
  };

  useEffect(() => {
    if (!authStore.user) {
      authStore.checkAuth();
    } else if (!user) {
      console.log("user is already logged in: ", authStore.user);
      const user = authStore.user;
      setUser(user);
      const guideStatus =
        user.guideStatus === GuideStatus.HASPAID
          ? GuideStatus.LOADING
          : user.guideStatus;
      if (
        user.guideStatus === GuideStatus.HASPAID &&
        user.hasPaid &&
        !isFetching.current
      ) {
        generateGuide(user);
      } else {
        setGuideStatus(guideStatus);
      }

      if (guideStatus === GuideStatus.LOADING) {
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
      }
    }
  }, [authStore.user]);

  useEffect(() => {
    if (
      authStore.user &&
      authStore.user.guideGenerationRunId &&
      authStore.user.guideGenerationThreadId &&
      !isFetching.current &&
      !runInfo.threadId &&
      !runInfo.runId
    ) {
      console.log("user has a runId and threadId: ", user);
      setRunInfo({
        threadId: authStore.user.guideGenerationThreadId,
        runId: authStore.user.guideGenerationRunId,
      });
    }
  }, [authStore.user]);

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

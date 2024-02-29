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

export type RunInfo = {
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
    const updatedUser = {
      ...user!,
      questions: questions,
      guideGenerationThreadId: runInfo.threadId,
      guideGenerationRunId: runInfo.runId,
    };
    authStore.updateUserData(updatedUser);
  };

  useEffect(() => {
    if (user) {
      setGuideStatus(user.guideStatus);
    }
  }, [user]);

  const isFetching = useRef<boolean>(false);
  const isSubscribed = useRef<boolean>(false);

  const generateGuide = (user: User) => {
    isFetching.current = true;
    const newUser = { ...user, guideStatus: GuideStatus.LOADING };
    authStore.setUser(newUser);
    console.log("user is in guide loading status: ", newUser.guideStatus);
    setUser(newUser);
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
        .then(async (value) => {
          const response = await value.json();
          const runInfo = response.runInfo;
          console.log("Run info: ", runInfo);
          setRunInfo(runInfo);
          console.log("Guide generation request sent.");
          isFetching.current = false;
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
        setRunInfo({
          threadId: undefined,
          runId: undefined,
        });
      } else if (status === "in_progress") {
        console.log("Guide generation status: ", status);
      } else {
        setRunInfo({
          threadId: undefined,
          runId: undefined,
        });
        setGuideStatus(GuideStatus.ERROR);
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

      if (
        user.guideStatus === GuideStatus.HASPAID &&
        user.hasPaid &&
        !isFetching.current
      ) {
        generateGuide(user);
      } else {
        if (isFetching.current) {
          setUser({ ...user, guideStatus: GuideStatus.LOADING });
        } else setUser(user);
      }
    }
  }, [authStore.user]);

  const getRunInfo = async () => {
    if (runInfo.threadId === undefined && runInfo.runId === undefined) {
      const user = await authStore.getUserOrCreateIfNotExists(
        authStore.user!.firebaseUser!
      );
      setRunInfo({
        threadId: user.guideGenerationThreadId,
        runId: user.guideGenerationRunId,
      });
    }
  };

  useEffect(() => {
    if (guideStatus === GuideStatus.LOADING && !isSubscribed.current) {
      getRunInfo();

      isSubscribed.current = true;
      console.log("user is in guide loading status: ", user);

      // Setup listener for guideStatus updates
      const unsubscribe = authStore.listenToUserGuideStatus(
        (newGuideStatus) => {
          console.log("new guide status: ", newGuideStatus);
          if (newGuideStatus === GuideStatus.LOADED) {
            console.log("Guide is loaded, unsubscribing from updates.");
            onGuideLoaded();
            unsubscribe?.();
            isSubscribed.current = false;
          } else {
            onGuideLoaded();
          }
        }
      );

      // Cleanup function to unsubscribe
      return () => {
        isSubscribed.current = false;
        unsubscribe?.();
      };
    }
  }, [guideStatus]);

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
        genGuide={() => generateGuide(user!)}
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
        genGuide={() => generateGuide(user!)}
      />
    );
  }
};

UserProfile.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(UserProfile);

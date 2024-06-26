"use client";
import "../../app/globals.css";
import React, { ReactElement, useEffect, useState } from "react";
import { GuideStatus, User } from "../../app/model/user";
import { Question, questToFitnessData } from "../../app/model/questionaire";
import { loadStripe } from "@stripe/stripe-js";
import { NextPageWithLayout } from "@/pages/_app";
import { useStore } from "@/RootStoreProvider";
import { observer } from "mobx-react";
import Zone2GuideDesktopLayout from "./DesktopLayout";
import Zone2GuideMobileLayout from "./MobileLayout";
import { useRouter } from "next/router";
import Head from "next/head";

const stripePromise = loadStripe(
  "pk_test_51Oc6ntFwAwE234wG9Lu3IfmZQXEv7nHPJx7alrzq00EzVaO74jpv7RifR5iRrkjvTS8BSv67QvoQJz2W2ccTt2bC00gLDhFGLf"
);

const CreateGuide: NextPageWithLayout = () => {
  const { authStore, generalStore, guideStore } = useStore();
  const router = useRouter();

  const { user } = authStore;
  const { isMobileView } = generalStore;

  const [userID, setUserID] = useState<string | undefined>(user?.uid);

  const [pageIndex, setPageIndex] = useState(0);
  const [previousPageIndex, setPreviousPageIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[] | undefined>(
    user?.questions
  );
  const [canSubmit, setCanSubmit] = useState(false);
  const [forward, setForward] = useState(false);

  useEffect(() => {
    if (user && user?.uid !== userID) {
      setUserID(user?.uid);
      const newQuestions = user?.questions;
      if (newQuestions) {
        setQuestions(newQuestions);
      }
    }
  }, [user]);

  const handleOnQuestCompleted = (questions: Question[]) => {
    setCanSubmit(true);
    setQuestions(questions);
    const fitnessData = questToFitnessData(questions);
    const newUser: User = {
      ...user!,
      questions: questions,
      guideItems: user?.guideItems ?? [],
      fitnessLevel: fitnessData.fitnessLevel,
    };

    authStore.setUser(newUser);
  };

  const onBack = (isForward: boolean) => {
    if (pageIndex > 0) {
      if (pageIndex === 1 && isForward) {
        setForward(false);
        setTimeout(() => {
          onBack(false);
        }, 10);
      } else {
        setPageIndex(pageIndex - 1);
        setPreviousPageIndex(pageIndex);
      }
    }
  };

  const onConfirm = async (isForward: boolean) => {
    if (pageIndex < 2 && user?.guideStatus !== GuideStatus.FREEBIE) {
      if (pageIndex === 1 && !isForward) {
        setForward(true);
        setTimeout(() => {
          onConfirm(true);
        }, 10);
      } else {
        setPageIndex(pageIndex + 1);
        setPreviousPageIndex(pageIndex);
      }
    } else {
      const newUser: User = {
        ...user!,
        questions: questions!,
        guideItems: [],
        hasDeclinedReview: false,
        hasReviewed: false,
        previousGuideItems: user?.guideItems ?? [],
      };
      guideStore.setGuideItems([]);
      if (user?.guideStatus === GuideStatus.FREEBIE) {
        const newNewUser: User = {
          ...newUser,
          guideStatus: GuideStatus.HASPAID,
          hasPaid: true,
        };
        await authStore.updateUserData(newNewUser);
        router.push("/");
      } else {
        await authStore.updateUserData(newUser);
        redirectToStripe();
      }
    }
  };

  const redirectToStripe = () => {
    const isLocal = window.location.hostname === "localhost";

    const stripeUrl = isLocal
      ? "https://buy.stripe.com/test_4gwaII0gpc3QfDy7ss"
      : "https://buy.stripe.com/28o034f8xeAZczC7ss";
    const prefilledEmail = user!.firebaseUser?.email ?? "";

    window.location.href = `${stripeUrl}?prefilled_email=${encodeURIComponent(
      prefilledEmail
    )}&client_reference_id=${user!.uid}`;
  };

  useEffect(() => {
    if (!user) {
      authStore.setOpen(true);
    }
  }, [user, user, authStore]);

  const getExit = () => {
    // If we are moving to a higher pageIndex, slide out to the left (-100)
    // If we are moving to a lower pageIndex, slide out to the right (100)
    if (pageIndex === 1 && previousPageIndex === 0 && forward) {
      return -100;
    }

    if (pageIndex === 1 && previousPageIndex === 2) {
      return 100;
    }

    if (pageIndex === 1 && previousPageIndex === 0) return -100;

    const value = pageIndex > previousPageIndex ? 100 : -100;
    return value;
  };

  const getInitial = (): number => {
    // If we are moving to a higher pageIndex, slide in from the right (100)
    // If we are moving to a lower pageIndex, slide in from the left (-100)
    if (pageIndex < previousPageIndex) return -100;
    if (pageIndex > previousPageIndex) return 100;
    else if (pageIndex < previousPageIndex) return 100;
    return 100;
  };

  let content;
  if (isMobileView) {
    content = (
      <Zone2GuideMobileLayout
        pageIndex={pageIndex}
        userID={userID}
        questions={questions}
        user={user}
        canSubmit={canSubmit}
        setCanSubmit={setCanSubmit}
        handleOnQuestCompleted={handleOnQuestCompleted}
        onBack={onBack}
        onConfirm={onConfirm}
        getInitial={getInitial}
        getExit={getExit}
        forward={forward}
        stripePromise={stripePromise}
      />
    );
  } else {
    content = (
      <Zone2GuideDesktopLayout
        pageIndex={pageIndex}
        userID={userID}
        questions={questions}
        user={user}
        canSubmit={canSubmit}
        setCanSubmit={setCanSubmit}
        handleOnQuestCompleted={handleOnQuestCompleted}
        onBack={onBack}
        onConfirm={onConfirm}
        getInitial={getInitial}
        getExit={getExit}
        forward={forward}
        stripePromise={stripePromise}
      />
    );
  }

  return (
    <>
      <Head>
        <title>Create Guide</title>
      </Head>
      {content}
    </>
  );
};

CreateGuide.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(CreateGuide);

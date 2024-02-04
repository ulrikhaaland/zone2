"use client";
import "../../app/globals.css";
import React, { ReactElement, useEffect, useState } from "react";
import { FitnessData, User, fitnessDataToJson } from "../../app/model/user";
import { Question, questToFitnessData } from "../../app/model/questionaire";
import Questionnaire from "../../app/components/questionnaire/Questionnaire";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineArrowLeft } from "react-icons/ai";
import CheckoutPage from "../../app/pages/CheckoutForm";
import Guide from "../../app/components/guide";
import UserInfoConfirmationPage from "../../app/pages/UserInfoConfirmationPage";
import { NextPageWithLayout } from "@/pages/_app";
import { useStore } from "@/RootStoreProvider";
import { observer } from "mobx-react";
import { a } from "react-spring";

const stripePromise = loadStripe(
  "pk_test_51Oc6ntFwAwE234wG9Lu3IfmZQXEv7nHPJx7alrzq00EzVaO74jpv7RifR5iRrkjvTS8BSv67QvoQJz2W2ccTt2bC00gLDhFGLf"
);

const HomePage: NextPageWithLayout = () => {
  const { authStore } = useStore();

  const [user, setUser] = useState<User>(
    authStore.user ?? {
      questions: [],
      guideItems: [],
      usesCM: true,
      usesKG: true,
      uid: "",
      credits: 0,
    }
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [previousPageIndex, setPreviousPageIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[] | undefined>(
    authStore.user?.questions
  );
  const [canSubmit, setCanSubmit] = useState(false);
  const [forward, setForward] = useState(false);

  useEffect(() => {
    if (authStore.user && user.uid !== authStore.user.uid) {
      console.log("setting user");
      setUser(authStore.user);
      const newQuestions = authStore.user?.questions;
      if (newQuestions) {
        setQuestions([...newQuestions]);
      }
    }
  }, [authStore.user]);

  const handleOnQuestCompleted = (questions: Question[]) => {
    setCanSubmit(true);
    setQuestions(questions);
    const newUser: User = {
      ...user!,
      questions: questions,
      guideItems: authStore.user?.guideItems ?? [],
    };
    console.log(newUser);
    authStore.updateUserData(newUser);

    setUser(newUser);
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

  const onConfirm = (isForward: boolean) => {
    if (pageIndex < 2) {
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
      redirectToStripe();
    }
  };

  useEffect(() => {
    console.log("forward");
  }, [forward]);

  const redirectToStripe = () => {
    const stripeUrl = "https://buy.stripe.com/test_4gwaII0gpc3QfDy7ss";
    console.log(user.firebaseUser);
    const prefilledEmail = user.firebaseUser?.email ?? "";
    const returnUrl = `${window.location.origin}/profile?userId=${user.uid}`;

    window.location.href = `${stripeUrl}?prefilled_email=${encodeURIComponent(
      prefilledEmail
    )}&redirect_to=${encodeURIComponent(returnUrl)}&client_reference_id=${
      user.uid
    }`;
  };

  useEffect(() => {
    if (!authStore.user) {
      authStore.setOpen(true);
    }
  }, [user, authStore.user, authStore]);

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

  const getInitial = () => {
    // If we are moving to a higher pageIndex, slide in from the right (100)
    // If we are moving to a lower pageIndex, slide in from the left (-100)
    if (pageIndex < previousPageIndex) return -100;
    if (pageIndex > previousPageIndex) return 100;
    else if (pageIndex < previousPageIndex) return 100;
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
            backgroundImage: "url('/assets/images/runner/runner8.png')",
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
      <div className="flex overflow-hidden flex-col items-center min-h-max p-4 relative">
        <div className="w-full md:border md:border-gray-700 md:rounded-lg bg-black bg-opacity-60 rounded-lg md:overflow-hidden max-w-md md:shadow-md md:min-h-[83.5dvh] md:max-h-[87.5dvh] min-h-[86.5dvh] max-h-[86.5dvh]">
          <AnimatePresence mode="wait">
            <motion.div
              className="relative z-0" // Ensure content is below the overlays
              key={pageIndex}
              initial={{ opacity: 0, x: getInitial() }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: pageIndex === 1 ? (forward ? -100 : 100) : getExit(),
              }}
              transition={{ duration: 0.25 }}
            >
              {pageIndex === 0 && (
                <Questionnaire
                  key={user.uid}
                  onQuestCompleted={handleOnQuestCompleted}
                  user={user}
                  questions={questions}
                  canSubmit={setCanSubmit}
                  isProfile={false}
                />
              )}
              {pageIndex === 1 && (
                <UserInfoConfirmationPage
                  fitnessData={questToFitnessData(questions!)}
                  user={user}
                />
              )}
              {pageIndex === 2 && (
                <Elements stripe={stripePromise}>
                  <CheckoutPage />
                </Elements>
              )}
            </motion.div>
          </AnimatePresence>
          {/* Button Container */}
          <div className="flex justify-between items-center md:px-6 relative pt-12 md:pt-2 md-pb-0 pb-4">
            {pageIndex !== 0 ? (
              <button
                className="flex items-center bg-gray-400 hover:bg-white text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                type="button"
                onClick={() => onBack(forward)}
              >
                <AiOutlineArrowLeft className="mr-2" /> Back
              </button>
            ) : (
              <button
                className="flex items-center opacity-0 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                type="button"
                onClick={() => onBack(forward)}
                disabled
              >
                <AiOutlineArrowLeft className="mr-2" /> Back
              </button>
            )}

            {/* Pagination dots */}
            <div className="flex items-center">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={`h-2 w-2 mx-1 rounded-full ${
                    pageIndex === index ? "bg-white" : "bg-gray-600"
                  }`}
                ></span>
              ))}
            </div>
            <button
              className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
                canSubmit
                  ? "bg-secondary-button-dark hover:bg-primary-button-dark text-white"
                  : "bg-secondary-button-dark text-white opacity-50 cursor-not-allowed"
              }`}
              type="submit"
              disabled={!canSubmit}
              onClick={(e) => {
                if (canSubmit) {
                  onConfirm(forward);
                } else {
                  e.preventDefault();
                }
              }}
            >
              {pageIndex !== 2 ? "Continue" : "Purchase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(HomePage);

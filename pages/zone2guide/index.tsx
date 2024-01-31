"use client";
import "../../app/globals.css";
import React, { ReactElement, useEffect, useState } from "react";
import { User, fitnessDataToJson } from "../../app/model/user";
import { Question, questToFitnessData } from "../../app/model/questionaire";
import Questionnaire from "../../app/components/questionnaire/Questionnaire";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineArrowLeft } from "react-icons/ai";
import CheckoutPage from "../../app/pages/CheckoutForm";
import Guide from "../../app/pages/GuidePage";
import UserInfoConfirmationPage from "../../app/pages/UserInfoConfirmationPage";
import { NextPageWithLayout } from "@/pages/_app";

const stripePromise = loadStripe(
  "pk_test_51Oc6ntFwAwE234wG9Lu3IfmZQXEv7nHPJx7alrzq00EzVaO74jpv7RifR5iRrkjvTS8BSv67QvoQJz2W2ccTt2bC00gLDhFGLf"
);

const HomePage: NextPageWithLayout = () => {
  const [user, setUser] = useState<User>({
    usesCM: true,
    usesKG: true,
    fitnessData: undefined,
    guideItems: [],
    uid: "",
    email: "",
    credits: 1000,
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [previousPageIndex, setPreviousPageIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[] | undefined>();
  const [canSubmit, setCanSubmit] = useState(false);
  const [forward, setForward] = useState(false);

  const handleOnQuestCompleted = (questions: Question[]) => {
    const fitnessData = questToFitnessData(questions);
    setCanSubmit(true);
    setQuestions(questions);
    setUser({
      ...user,
      fitnessData,
      guideItems: [],
    });
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
    const prefilledEmail = "ulrikhaland@gmail.com";
    const returnUrl = `${window.location.origin}/your-return-url?userId=${123}`;

    window.location.href = `${stripeUrl}?prefilled_email=${encodeURIComponent(
      prefilledEmail
    )}&redirect_to=${encodeURIComponent(
      returnUrl
    )}&client_reference_id=asd12343`;
  };

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
    <div className="bg-third-bg w-full font-custom md:h-screen min-h-[100dvh]">
      <h1 className="text-3xl text-center font-bold text-title2 pt-4 mb-4">
        Zone 2 Guide Creation
      </h1>
      <div className="flex overflow-hidden flex-col items-center min-h-max md:bg-secondary-bg bg-secondary-bg p-4 relative">
        <div
          className="w-full md:overflow-hidden max-w-md md:shadow-md md:rounded md:bg-primary-bg bg-secondary-bg
         md:min-h-[87.5dvh] md:max-h-[87.5dvh] min-h-[86.5dvh] max-h-[86.5dvh] 
        "
        >
          {/* Overlays for animation */}
          <div className="absolute top-0 bottom-0 left-0 w-6 md:bg-secondary-bg z-10"></div>
          <div className="absolute top-0 bottom-0 right-0 w-6 md:bg-secondary-bg z-10"></div>
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
                  onQuestCompleted={handleOnQuestCompleted}
                  user={user}
                  questions={questions}
                  canSubmit={setCanSubmit}
                />
              )}
              {pageIndex === 1 && user.fitnessData && (
                <UserInfoConfirmationPage
                  fitnessData={user.fitnessData}
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
                className="flex items-center bg-subtitle hover:bg-secondary-button-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
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
                    pageIndex === index ? "bg-primary-button" : "bg-gray-300"
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

      {pageIndex === 3 && user && (
        <Guide
          onLoadGuideItems={(items) => setUser({ ...user, guideItems: items })}
          guideItems={user.guideItems}
          fitnessData={user?.fitnessData!}
        />
      )}
    </div>
  );
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default HomePage;

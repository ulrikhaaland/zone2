// Import necessary dependencies
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import Questionnaire from "../../app/components/questionnaire/Questionnaire";
import UserInfoConfirmationPage from "../../app/pages/UserInfoConfirmationPage";
import CheckoutPage from "../../app/pages/CheckoutForm";
import { GuideStatus, User } from "../../app/model/user";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Question, questToFitnessData } from "@/app/model/questionaire";

// Define the props interface
interface CreateGuideDesktopProps {
  pageIndex: number;
  userID: string | undefined;
  questions: Question[] | undefined;
  user: User | null | undefined;
  canSubmit: boolean;
  handleOnQuestCompleted: (questions: Question[]) => void;
  onBack: (isForward: boolean) => void;
  onConfirm: (isForward: boolean) => void;
  getInitial: () => number;
  getExit: () => number;
  forward: boolean;
  stripePromise: any; // Use the appropriate type for your Stripe promise
  setCanSubmit: (canSubmit: boolean) => void;
}

// The Desktop Layout Component
const CreateGuideDesktop: React.FC<CreateGuideDesktopProps> = ({
  pageIndex,
  userID,
  questions,
  user,
  canSubmit,
  handleOnQuestCompleted,
  onBack,
  onConfirm,
  getInitial,
  getExit,
  forward,
  stripePromise,
  setCanSubmit,
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
            backgroundImage: "url('/assets/images/swimmer/swimmer.png')",
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

      {user && (
        <div className="flex overflow-hidden flex-col items-center pt-24 md:pt-28 px-4 relative">
          <div className="w-full md:border md:border-gray-700 md:rounded-lg bg-black/60 rounded-lg md:overflow-hidden max-w-md md:shadow-md">
            <AnimatePresence mode="wait">
              <motion.div
                className="relative z-0" // Ensure content is below the overlays
                key={pageIndex}
                initial={{ opacity: 0, x: canSubmit ? getInitial() : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: pageIndex === 1 ? (forward ? -100 : 100) : getExit(),
                }}
                transition={{ duration: 0.25 }}
              >
                {pageIndex === 0 && (
                  <Questionnaire
                    key={userID}
                    onQuestCompleted={handleOnQuestCompleted}
                    user={
                      user ?? {
                        uid: "0",
                        questions: [],
                        guideItems: [],
                        firebaseUser: undefined,
                        usesCM: true,
                        usesKG: true,
                        credits: 0,
                      }
                    }
                    questions={questions}
                    canSubmit={setCanSubmit}
                    isProfile={false}
                  />
                )}
                {pageIndex === 1 && (
                  <UserInfoConfirmationPage
                    fitnessData={questToFitnessData(questions!)} // Adjust accordingly if you have a different method to transform questions to fitnessData
                    user={user!}
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
                  className="flex items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline
                bg-black text-whitebg border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-900"
                  type="button"
                  onClick={() => onBack(forward)}
                >
                  <AiOutlineArrowLeft className="mr-2" /> Back
                </button>
              ) : (
                <button
                  className="flex opacity-0 items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline
                bg-black text-whitebg border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-900"
                  type="button"
                  disabled={true}
                  onClick={() => onBack(forward)}
                >
                  <AiOutlineArrowLeft className="mr-2" /> Back
                </button>
              )}

              {/* Pagination dots */}
              {user.guideStatus !== GuideStatus.FREEBIE && (
                <div className="flex items-center">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className={`h-2 w-2 mx-1 rounded-full ${
                        pageIndex === index ? "bg-whitebg" : "bg-gray-600"
                      }`}
                    ></span>
                  ))}
                </div>
              )}
              <button
                className={`font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
                  canSubmit
                    ? "bg-blue-600 hover:bg-blue-800 text-whitebg"
                    : "bg-secondary-button-dark text-whitebg opacity-50 cursor-not-allowed"
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
                {pageIndex !== 2
                  ? pageIndex === 0 && user.guideStatus === GuideStatus.FREEBIE
                    ? "Create"
                    : "Continue"
                  : "Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGuideDesktop;

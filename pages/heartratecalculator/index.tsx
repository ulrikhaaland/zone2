import { ReactElement, useEffect, useState } from "react";
import { NextPageWithLayout } from "../_app";
import CategoryIcon from "@mui/icons-material/Category";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useStore } from "@/RootStoreProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Question, questionnaireList } from "@/app/model/questionaire";
import HeartRateInfo from "./heart_rate_info";
import HeartRateZones from "./heart_rate_zones";
import {
  HeartRateZone,
  calculateHeartRateZones,
} from "@/app/utils/HRZonesCalculator";
import { observer } from "mobx-react";
import { User } from "@/app/model/user";

const questions = questionnaireList;

export const HeartRateZonesPage: NextPageWithLayout = () => {
  const { generalStore, authStore } = useStore();
  const isMobileView = generalStore.isMobileView;
  const [user, setUser] = useState<User | undefined>();
  const [pageIndex, setPageIndex] = useState(0);
  const [ageQ, setAgeQ] = useState<Question | undefined>();
  const [restingHeartRateQ, setRestingHeartRateQ] = useState<
    Question | undefined
  >();
  const [maxHeartRateQ, setMaxHeartRateQ] = useState<Question | undefined>();
  const [HRZones, setHRZones] = useState<HeartRateZone[] | undefined>(
    authStore.user?.heartRateZones
  );

  useEffect(() => {
    if (!user && authStore.user) {
      console.log("User is not set");
      // Update user state when authStore.user changes and the current user state is not set
      const user = authStore.user;
      setUser(user);
      // Function to update a question based on user's answers or default questions
      const updateQuestion = (id: number): Question | undefined => {
        const userQuestion = user?.questions.find((q) => q.id === id);
        return userQuestion ? userQuestion : questions.find((q) => q.id === id);
      };

      // Update all questions with user's answers
      const age = updateQuestion(0);
      const rhr = updateQuestion(11);
      const mhr = updateQuestion(12);
      if (age?.answer && mhr && (mhr?.answer === "" || !mhr?.answer)) {
        mhr!.answer = (220 - Number(age?.answer)).toString();
      }
      setAgeQ(age);
      setRestingHeartRateQ(rhr);
      setMaxHeartRateQ(mhr);
      handleOnCalculateHRZones(
        Number(age?.answer),
        Number(mhr?.answer),
        Number(rhr?.answer)
      );
    }
  }, [authStore.user]);

  const handleOnCalculateHRZones = (
    age?: number,
    mhr?: number,
    rhr?: number
  ) => {
    if (age || (mhr && rhr)) {
      const zones = calculateHeartRateZones(age, mhr, rhr);
      setHRZones(zones);
      authStore.user!.heartRateZones = zones;
      setPageIndex(0);
    }
  };

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
      <div className="md:pt-24 pt-8">
        {/* Page Content */}
        {/* {!isMobileView && (
          <h1
            className="text-5xl text-whitebg text-center font-bold pt-6 mb-4 relative z-10"
            style={{
              textShadow: "10px 10px 10px rgba(0,0,0,1)",
            }}
          >
            Heart Rate Zones
          </h1>
        )} */}
        {/* Button Container */}
        {HRZones && (
          <div className="relative flex justify-between items-center md:px-6 pt-12 md:pt-0 md-pb-0 pb-4 w-[300px] mx-auto">
            <button
              className={`flex w-[160px] items-center justify-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
                pageIndex === 0
                  ? "bg-whitebg text-black border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-300"
                  : "bg-black text-whitebg border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-900"
              }`}
              type="button"
              onClick={() => setPageIndex(0)}
            >
              <CategoryIcon
                className="mr-2"
                style={{ color: pageIndex === 0 ? "black" : "white" }}
              />
              Zones
            </button>
            <div
              style={{
                width: "50px",
                height: "10px",
                backgroundColor: "transparent",
              }}
            ></div>
            <button
              className={`flex w-[160px] justify-center items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
                pageIndex === 1
                  ? "bg-whitebg text-black border border-transparent hover:bg-gray-300"
                  : "bg-black text-whitebg border border-gray-700 hover:bg-gray-900"
              }`}
              type="submit"
              onClick={(e) => setPageIndex(1)}
            >
              <AccountCircleIcon
                className="mr-2"
                style={{ color: pageIndex === 1 ? "black" : "white" }}
              />
              Info
            </button>
          </div>
        )}
        {/* Page Content */}
        <div className="flex w-full overflow-hidden md:rounded flex-col items-center min-h-max p-4 relative">
          <div className="w-full relative md:overflow-hidden md:shadow-md md:max-h-[77.5dvh] max-h-[76.5dvh]">
            <AnimatePresence mode="wait">
              <motion.div
                className="relative z-0 flex justify-center" // Ensure content is below the overlays
                key={pageIndex}
                initial={{ opacity: 0, x: pageIndex === 0 ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: pageIndex === 0 ? -100 : 100,
                }}
                transition={{ duration: 0.25 }}
              >
                {pageIndex === 0 && HRZones && (
                  <HeartRateZones zones={HRZones} />
                )}
                {(pageIndex === 1 || !HRZones) &&
                  ageQ &&
                  restingHeartRateQ &&
                  maxHeartRateQ && (
                    <HeartRateInfo
                      questions={[ageQ, restingHeartRateQ, maxHeartRateQ]}
                      isMobileView={isMobileView}
                      user={user!}
                      hasHRZones={HRZones !== undefined}
                      onCalculateHRZones={() =>
                        handleOnCalculateHRZones(
                          Number(ageQ.answer),
                          Number(maxHeartRateQ.answer),
                          Number(restingHeartRateQ.answer)
                        )
                      }
                    />
                  )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

HeartRateZonesPage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(HeartRateZonesPage);

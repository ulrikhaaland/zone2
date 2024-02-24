import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "../_app";
import { observer } from "mobx-react";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useStore } from "@/RootStoreProvider";
import { AnimatePresence, motion } from "framer-motion";
import QuestionItem from "@/app/components/questionnaire/QuestionItem";
import { Question, questionnaireList } from "@/app/model/questionaire";

const questions = questionnaireList;

const HeartRateZonesPage: NextPageWithLayout = () => {
  const { generalStore, authStore } = useStore();
  const isMobileView = generalStore.isMobileView;
  const user = authStore.user;
  const [pageIndex, setPageIndex] = useState(0);
  const [ageQ, setAgeQ] = useState<Question>(() => {
    if (user?.questions.find((q) => q.id === 0)) {
      return user?.questions.find((q) => q.id === 0) as Question;
    } else {
      return questions.find((q) => q.id === 0) as Question;
    }
  });
  const [restingHeartRateQ, setRestingHeartRateQ] = useState<Question>(() => {
    if (user?.questions.find((q) => q.id === 11)) {
      return user?.questions.find((q) => q.id === 11) as Question;
    } else {
      return questions.find((q) => q.id === 11) as Question;
    }
  });
  const [maxHeartRateQ, setMaxHeartRateQ] = useState<Question>(() => {
    if (user?.questions.find((q) => q.id === 12)) {
      return user?.questions.find((q) => q.id === 12) as Question;
    } else {
      return questions.find((q) => q.id === 12) as Question;
    }
  });

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
        className="text-5xl text-whitebg text-center font-bold pt-6 mb-4 relative z-10"
        style={{
          textShadow: "10px 10px 10px rgba(0,0,0,1)",
        }}
      >
        Heart Rate Zones
      </h1>
      {/* Button Container */}
      <div className="relative flex justify-between items-center md:px-6 pt-12 md:pt-2 md-pb-0 pb-4 w-[300px] mx-auto">
        <button
          className={`flex w-[160px] items-center justify-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
            pageIndex === 0
              ? "bg-whitebg text-black border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-300"
              : "bg-black text-whitebg border border-gray-700 transition duration-150 ease-in-out hover:bg-gray-900"
          }`}
          type="button"
          onClick={() => setPageIndex(0)}
        >
          <MenuBookIcon
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
      {/* Page Content */}
      <div className="flex overflow-hidden md:rounded flex-col items-center min-h-max p-4 relative">
        <div className="max-w-md w-full md:overflow-hidden md:shadow-md md:min-h-[73.5dvh] md:max-h-[77.5dvh] min-h-[76.5dvh] max-h-[76.5dvh]"></div>
      </div>
    </div>
  );
};

HeartRateZonesPage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(HeartRateZonesPage);

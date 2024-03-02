import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import CloseIcon from "@mui/icons-material/Close";
import { useStore } from "@/RootStoreProvider";
import { on } from "events";
import { db } from "@/pages/_app";
import { addDoc, collection } from "firebase/firestore";
import { User } from "@/app/model/user";

interface FeedbackFABProps {
  onExpand?: (expanded: boolean) => void;
  expanded?: boolean;
}

const FeedbackFAB = (props: FeedbackFABProps) => {
  const { onExpand } = props;
  const { authStore, generalStore } = useStore();
  const { user } = authStore;
  const isMobileView = generalStore.isMobileView;

  const [expanded, setExpanded] = useState(props.expanded || false);
  const [positiveFeedback, setPositiveFeedback] = useState("");
  const [negativeFeedback, setNegativeFeedback] = useState("");

  const isSubmitDisabled =
    positiveFeedback.trim() === "" && negativeFeedback.trim() === "";

  useEffect(() => {
    setExpanded(props.expanded || false);
  }, [props.expanded]);

  const toggleExpand = () => {
    const expand = !expanded;
    setExpanded(expand);
    onExpand && onExpand(expand);
  };

  const handlePositiveFeedbackChange = (e: any) => {
    setPositiveFeedback(e.target.value);
  };

  const handleNegativeFeedbackChange = (e: any) => {
    setNegativeFeedback(e.target.value);
  };

  const uploadFeedback = async () => {
    try {
      // Assuming `uid` is available from your authentication store or context
      const uid = user?.uid; // You need to obtain this from your auth context/store
      const guideItems = user?.guideItems;
      // Ensure all necessary data is available

      const newUser: User = {
        ...user!,
        hasReviewed: true,
      };

      authStore.setUser(newUser);
      authStore.updateUserData(newUser);

      const docRef = await addDoc(collection(db, "feedback"), {
        uid,
        positiveFeedback,
        negativeFeedback,
        guideItems, // Assuming guideItems is already in the desired format
        createdAt: new Date(), // Optionally, store the creation date
      });

      console.log("Feedback document written with ID: ", docRef.id);
      // Optionally, reset feedback form or provide user feedback
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    uploadFeedback();
    console.log("Positive Feedback:", positiveFeedback);
    console.log("Negative Feedback:", negativeFeedback);
    setExpanded(false);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-30">
      {expanded && (
        <div
          className={`absolute bottom-12 right-0 mb-4 p-4 bg-black bg-opacity-60 rounded-lg border border-gray-700 z-0
                    ${isMobileView ? "w-[92.5dvw]" : "w-80"}`}
        >
          <IconButton
            className="absolute top-0 right-0 text-white"
            onClick={toggleExpand}
          >
            <CloseIcon />
          </IconButton>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {/* Negative Feedback */}
            <label
              htmlFor="negativeFeedback"
              className="text-white font-semibold"
            >
              Negative Feedback
            </label>
            <textarea
              id="negativeFeedback"
              className="w-full py-2 px-3 leading-tight border border-gray-700 rounded-lg focus:outline-none focus:border-white bg-black text-white transition duration-300"
              placeholder="What didn't you like?"
              value={negativeFeedback}
              onChange={handleNegativeFeedbackChange}
              rows={3}
            />
            {/* Positive Feedback */}
            <label
              htmlFor="positiveFeedback"
              className="text-white font-semibold"
            >
              Positive Feedback
            </label>
            <textarea
              id="positiveFeedback"
              className="w-full py-2 px-3 leading-tight border border-gray-700 rounded-lg focus:outline-none focus:border-white bg-black text-white transition duration-300"
              placeholder="What did you like?"
              value={positiveFeedback}
              onChange={handlePositiveFeedbackChange}
              rows={3}
            />
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`${
                isSubmitDisabled
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-white hover:bg-gray-300"
              } text-black py-3 rounded-lg transition duration-300 flex justify-center items-center`}
            >
              Submit
            </button>
          </form>
        </div>
      )}
      <button
        onClick={toggleExpand}
        className={`border border-gray-700 ${
          expanded
            ? "bg-black text-white hover:bg-gray-700"
            : "text-black bg-white hover:bg-gray-500"
        } py-2 px-4 rounded-full flex items-center space-x-2 transition duration-300`}
      >
        {expanded ? (
          <>
            <CloseIcon className="mr-1" fontSize="small" />
            Close
          </>
        ) : (
          <>
            <FeedbackIcon fontSize="small" />
            <span>Provide Feedback</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FeedbackFAB;

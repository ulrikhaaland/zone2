import { Question } from "@/app/model/questionaire";
import { User } from "@/app/model/user";
import HRQuestionItem from "./heart_rate_question_item";
import { useState } from "react";

interface HeartRateInfoProps {
  questions: Question[];
  isMobileView: boolean;
  user: User;
  hasHRZones: boolean;
  onCalculateHRZones: () => void;
}

const HeartRateInfo: React.FC<HeartRateInfoProps> = ({
  questions,
  isMobileView,
  user,
  hasHRZones,
  onCalculateHRZones,
}) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const [canSubmit, setCanSubmit] = useState(questions[2].answer !== undefined);

  return (
    <div
      className={`text-whitebg max-w-md rounded-lg h-full md:p-4 py-4 md:border md:border-gray-700 md:rounded-lg
              ${!isMobileView && "bg-black bg-opacity-60"}`}
    >
      {questions.map((question, index) => {
        return (
          <HRQuestionItem
            key={index}
            question={question}
            onAnswer={(answer) => {
              if (question.id === 0) {
                const value = answer?.toString();
                if (
                  value?.trim().length > 1 &&
                  (questions[2].answer === undefined ||
                    questions[2].answer === "")
                ) {
                  questions[2].answer = 220 - Number(value);
                }
              }
              const maxHr = questions[2].answer.toString();
              if (!maxHr || (maxHr && maxHr.trim().length < 3)) {
                if (canSubmit) setCanSubmit(false);
              } else {
                if (!canSubmit) setCanSubmit(true);
              }
            }}
            user={user}
            autoFocus={index === focusIndex}
            onFocusNext={(id) => {
              if (index === 0) setFocusIndex(1);
              else if (index === 1) setFocusIndex(2);
              if (
                id === 0 &&
                (questions[2].answer === undefined ||
                  questions[2].answer === "")
              ) {
                if (!canSubmit) setCanSubmit(true);
                questions[2].answer = 220 - Number(questions[0].answer);
              }
            }}
            onFocusCurrent={(id) => {
              console.log(id);
            }}
          />
        );
      })}
      <button
        className={`font-bold w-full py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
          canSubmit
            ? "bg-blue-600 hover:bg-blue-800 text-whitebg"
            : "bg-secondary-button-dark text-whitebg opacity-50 cursor-not-allowed"
        }`}
        type="submit"
        disabled={!canSubmit}
        onClick={(e) => {
          if (canSubmit) {
            onCalculateHRZones();
          } else {
            e.preventDefault();
          }
        }}
      >
        Calculate Zones
      </button>
    </div>
  );
};

export default HeartRateInfo;

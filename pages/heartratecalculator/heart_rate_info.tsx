import QuestionItem from "@/app/components/questionnaire/QuestionItem";
import { Question } from "@/app/model/questionaire";
import { User } from "@/app/model/user";
import HRQuestionItem from "./heart_rate_question_item";
import { useState } from "react";

interface HeartRateInfoProps {
  questions: Question[];
  isMobileView: boolean;
  user: User;
}

const HeartRateInfo: React.FC<HeartRateInfoProps> = ({
  questions,
  isMobileView,
  user,
}) => {
  const [focusIndex, setFocusIndex] = useState(0);

  return (
    <div
      className={`text-whitebg rounded-lg h-full p-4 md:border md:border-gray-700 md:rounded-lg
              ${!isMobileView && "bg-black bg-opacity-60"}`}
    >
      {questions.map((question, index) => {
        return (
          <HRQuestionItem
            key={index}
            question={question}
            onAnswer={(answer) => {}}
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
                questions[2].answer = 220 - Number(questions[0].answer);
              }
            }}
            onFocusCurrent={(id) => {
              console.log(id);
            }}
          />
        );
      })}
    </div>
  );
};

export default HeartRateInfo;

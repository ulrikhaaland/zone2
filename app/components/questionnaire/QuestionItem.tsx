import { AnswerType, Question } from "@/app/model/questionaire";
import { User } from "@/app/model/user";
import { get } from "http";
import {
  KeyboardEvent,
  KeyboardEventHandler,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { animated, useSpring } from "react-spring";

const FEET_TO_CM_CONVERSION_FACTOR = 30.48;
const POUNDS_TO_KG_CONVERSION_FACTOR = 0.453592;

interface QuestionItemProps {
  question: Question;
  onAnswer: (answer: any) => void;
  chosenExercise?: string;
  autoFocus?: boolean;
  user: User;
  onFocusNext: (id?: number) => void;
  onFocusCurrent: (id?: number) => void;
  displayError: boolean;
  completed: boolean;
}

export default function QuestionItem(props: QuestionItemProps) {
  const {
    question,
    onAnswer,
    chosenExercise,
    user,
    autoFocus,
    onFocusNext,
    onFocusCurrent,
    displayError,
    completed,
  } = props;
  const [answer, setAnswer] = useState<any>(question.answer);
  const [showDescription, setShowDescription] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(
    question.hasSkipped ? false : true
  );
  const [unit, setUnit] = useState(
    question.identifier === "height"
      ? user.usesCM
        ? "cm"
        : "feet"
      : user.usesKG
      ? "kg"
      : "lbs"
  );
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const inchesInputRef = useRef<HTMLInputElement>(null);

  const setFeetAndInches = () => {
    if (question.identifier === "height" && question.answer) {
      const feet = Math.floor(question.answer / FEET_TO_CM_CONVERSION_FACTOR);
      const inches = Math.round(
        (question.answer / FEET_TO_CM_CONVERSION_FACTOR - feet) * 12
      );
      setFeet(feet.toString());
      setInches(inches.toString());
    }
  };

  useEffect(() => {
    setFeetAndInches();
  }, []);

  useEffect(() => {
    if (question.identifier === "height" && unit === "feet") {
      user.usesCM = false;
      const totalFeet =
        parseFloat(feet || "0") + parseFloat(inches || "0") / 12; // Convert inches to feet
      const cm = convertFeetToCm(totalFeet).toFixed(0);
      console.log(cm);
      question.answer = cm;
      setAnswer(cm); // Set answer in feet and inches format
    }
  }, [feet, inches]);

  useEffect(() => {
    // Auto-focus on the input field if autoFocus is true
    if (autoFocus && inputRef.current) {
      if (question.id === 0 && completed) {
        return;
      }
      inputRef.current.focus();
      onFocusCurrent(question.id);
    }
  }, [autoFocus]);

  // This effect will run once on component mount
  useEffect(() => {
    setAnim({ opacity: 1, transform: "translateY(0)" });
  }, []);

  const [anim, setAnim] = useSpring(() => ({
    to: { opacity: 0, transform: "translateY(-20px)" },
    from: { opacity: 0, transform: "translateY(-20px)" },
    reset: true, // Reset the animation on mount
    onRest: () => {
      // This callback ensures that the animation has finished
      console.log("Animation finished");
    },
  }));

  const [skipAnim, setSkipAnim] = useSpring(() => ({
    opacity: 1,
    height: 40, // Assuming the button's height is 30px, adjust as needed
  }));

  // ... existing useEffect and functions ...

  const handleSkipQuestion = () => {
    // Animate out the skip button
    setSkipAnim({ opacity: 0, height: 0 });
    question.hasSkipped = true;
    setTimeout(() => {
      setShowSkipButton(false);
      onAnswer(undefined);
      setTimeout(() => {
        onFocusNext(question.id);
      }, 100);
    }, 50);
  };
  const handleInfoClick = () => {
    setShowDescription(!showDescription); // Toggle the description visibility
  };

  const convertFeetToCm = (feet: any) => {
    return feet * FEET_TO_CM_CONVERSION_FACTOR;
  };

  const convertPoundsToKg = (pounds: any) => {
    return pounds * POUNDS_TO_KG_CONVERSION_FACTOR;
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      if (inputRef.current) {
        inchesInputRef.current?.blur();
        inputRef.current.blur();
      }

      if (question.canSkip && !question.answer && showSkipButton) {
        // Skip the question if it's skippable and there's no answer
        handleSkipQuestion();
      } else {
        onFocusNext(question.id);
      }
    }
  };

  const handleOnAnswer = (val: any) => {
    // Validation check
    if (!question.canSkip && typeof val === "string" && !val.trim()) {
      question.hasError = true;
    } else {
      question.hasError = false;
    }

    if (question.canSkip && showSkipButton && val !== undefined) {
      setSkipAnim({ opacity: 0, height: 0 });
      setShowSkipButton(false);
    }

    if (question.identifier === "weight" && unit === "lbs") {
      user.usesKG = false;

      let kg = convertPoundsToKg(Number(val)).toFixed(0);

      if (val === "") {
        kg = "";
      }

      console.log(kg);
      question.answer = kg;
      setAnswer(val);
    } else {
      question.answer = val;
      setAnswer(val);
    }

    if (question.identifier === "height" && unit === "cm") {
      setFeetAndInches();
    }

    onAnswer(question.answer);
    /// trigger focus next
    if (
      question.answerType !== AnswerType.NUMBER &&
      question.answerType !== AnswerType.TEXT &&
      onFocusNext
    ) {
      onFocusNext();
    }
  };
  const toggleUnit = (newUnit: string) => {
    /// todo: make sure answer is converted once unit is changed with old value
    if (newUnit === "cm") {
      user.usesCM = true;
    } else if (newUnit === "kg") {
      user.usesKG = true;
    } else if (newUnit === "feet") {
      user.usesCM = false;
    } else if (newUnit === "lbs") {
      user.usesKG = false;
    }

    setUnit(newUnit);
  };

  function convertKgToLbs() {
    if (question.answer) {
      const val = Math.round(Number(question.answer) * 2.20462);
      setAnswer(val);
    }
  }

  const getAnswerType = (question: Question) => {
    if (question.identifier === "height" || question.identifier === "weight") {
      const isHeight = question.identifier === "height";
      const firstUnit = isHeight ? "cm" : "kg";
      const secondUnit = isHeight ? "feet" : "lbs";

      return (
        <div className="flex items-center">
          {isHeight && unit === "feet" ? (
            <>
              <input
                // Input field for feet
                ref={inputRef}
                className="border-2 text-whitebg border-gray-700 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300
                shadow appearance-none border rounded w-1/3 py-[9.5px] px-3 text-black leading-tight focus:outline-none focus:shadow-outline mr-2"
                placeholder="Feet"
                type="number"
                value={feet}
                onChange={(e) => {
                  setFeet(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (inchesInputRef.current && e.key === "Enter") {
                    inchesInputRef.current.focus();
                  }
                }}
              />
              <input
                // Input field for inches
                ref={inchesInputRef}
                className="border-2 text-whitebg border-gray-700 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300
                shadow appearance-none w-1/3 py-[9.5px] px-3 leading-tight focus:outline-none focus:shadow-outline mr-2"
                placeholder="Inches"
                type="number"
                value={inches}
                onChange={(e) => {
                  setInches(e.target.value);
                }}
                onKeyDown={handleKeyPress}
              />
            </>
          ) : (
            <input
              // Input field for cm or kg
              id={isHeight ? "height" : "weight"}
              ref={inputRef}
              className="w-full py-[9.5px] px-3 leading-tight border-2 text-whitebg border-gray-700 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300 mr-2"
              placeholder={isHeight ? "Height" : "Weight"}
              type="number"
              value={
                isHeight ? answer : unit === "kg" ? question.answer : answer
              }
              onChange={(e) => handleOnAnswer(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          )}
          {/* Unit toggle buttons */}
          <div className="flex">
            <button
              className={`font-bold py-2 px-4 rounded-lg w-20 mr-2 border-2 transition duration-150 ease-in-out ${
                unit === firstUnit
                  ? "bg-whitebg text-black hover:bg-gray-300 border-gray-200"
                  : "bg-black/50 text-white/50 hover:bg-gray-700 border-gray-700"
              }`}
              onClick={() => toggleUnit(firstUnit)}
            >
              {firstUnit}
            </button>
            <button
              className={`font-bold py-2 px-4 rounded-lg w-20 border-2 transition duration-150 ease-in-out ${
                unit === secondUnit
                  ? "bg-whitebg text-black hover:bg-gray-300 border-gray-200"
                  : "bg-black/50 text-white/50 hover:bg-gray-700 border-gray-700"
              }`}
              onClick={() => {
                if (unit === "kg") {
                  convertKgToLbs();
                }
                toggleUnit(secondUnit);
              }}
            >
              {secondUnit}
            </button>
          </div>
        </div>
      );
    }

    switch (question.answerType) {
      case AnswerType.TEXT:
        // text input field
        return (
          <textarea
            className="w-full py-[9.5px] px-3 leading-tight border-2 text-whitebg border-gray-700 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300 mr-2"
            id="teamName"
            placeholder={question.placeholder}
            value={answer}
            onKeyDown={handleKeyPress}
            onChange={(e) => handleOnAnswer(e.target.value)}
            maxLength={400}
            rows={3}
          />
        );
      case AnswerType.NUMBER:
        // Define a variable to hold error class
        const errorClass =
          displayError && question.hasError ? "border-red-500" : "";

        return (
          <>
            <input
              ref={inputRef}
              className={`${errorClass} w-full py-[9.5px] px-3 leading-tight border-2 text-whitebg border-gray-700 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300 mr-2`}
              id="teamName"
              type="number"
              placeholder={question.placeholder}
              value={answer}
              onChange={(e) => handleOnAnswer(e.target.value)}
              autoFocus={
                (question.id === 0 && !completed) || (autoFocus && !completed)
              }
              onKeyDown={handleKeyPress}
            />
            {displayError && question.hasError && (
              <p className="text-red-500 text-xs italic mt-2">
                Please enter a valid value.
              </p>
            )}
          </>
        );

      case AnswerType.YES_NO:
        return (
          <div className="flex flex-row">
            <div className="mr-2">
              <button
                className={`${
                  answer === "yes"
                    ? "bg-whitebg text-black border-gray-300 hover:bg-gray-300" // Highlighted color for 'Yes'
                    : "bg-black hover:bg-gray-700 text-white/50 border-gray-700"
                } border-2 font-bold py-2 px-4 rounded-lg`}
                onClick={() => handleOnAnswer("yes")}
              >
                Yes
              </button>
            </div>
            <div className="mr-2">
              <button
                className={`${
                  answer === "no"
                    ? "bg-whitebg text-black border-gray-300 hover:bg-gray-300" // Highlighted color for 'No'
                    : "bg-black hover:bg-gray-700 text-white/50 border-gray-700"
                } border-2 font-bold py-2 px-4 rounded-lg`}
                onClick={() => handleOnAnswer("no")}
              >
                No
              </button>
            </div>
          </div>
        );

      case AnswerType.SELECT:
        return (
          <div className="flex flex-row flex-wrap">
            {" "}
            {/* Added flex-wrap */}
            {question.availableAnswers?.map((option) => (
              <div key={option} className="mr-2 mb-2">
                {" "}
                {/* Added margin-bottom */}
                <button
                  className={`${
                    answer === option
                      ? "bg-whitebg text-black border-gray-300 hover:bg-gray-300" // Highlighted color
                      : "bg-black hover:bg-gray-700 text-white/50 border-gray-700" // Default color
                  } border-2 font-bold py-2 px-4 rounded-lg`}
                  onClick={() => handleOnAnswer(option)}
                >
                  {option}
                </button>
              </div>
            ))}
          </div>
        );
    }
  };

  const getQuestion = (): string => {
    if (question.identifier === "indoorOutdoorBoth") {
      return question.question.replace("[chosen exercise]", chosenExercise!);
    }
    return question.question;
  };
  return (
    <animated.div style={anim} className="mb-4">
      <div className="mb-4">
        <div className="grid grid-cols-[auto_1fr] items-start gap-x-2 mb-2">
          <label
            className="block text-whitebg text-sm font-bold"
            htmlFor="teamName"
            style={{
              textShadow: "10px 10px 10px rgba(0,0,0,1)",
            }}
          >
            {getQuestion()}
          </label>
          <AiOutlineInfoCircle
            className="text-whitebg cursor-pointer justify-self-end"
            onClick={handleInfoClick}
          />
        </div>
        {showDescription && (
          <p
            className="text-whitebg text-sm mb-2"
            style={{
              textShadow: "10px 10px 10px rgba(0,0,0,1)",
            }}
          >
            {question.description}
          </p>
        )}
        {getAnswerType(question)}
        {question.canSkip && showSkipButton && (
          <animated.button
            style={skipAnim}
            className="font-bold px-4 rounded-lg w-20 mt-4 border-2 transition duration-150 ease-in-out bg-black/50 text-white/50 hover:bg-gray-700 border-gray-700"
            onClick={handleSkipQuestion}
          >
            Skip
          </animated.button>
        )}
      </div>
    </animated.div>
  );
}

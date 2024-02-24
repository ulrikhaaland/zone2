import { AnswerType, Question } from "@/app/model/questionaire";
import { User } from "@/app/model/user";
import { useRouter } from "next/router";
import { KeyboardEvent, use, useEffect, useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { animated, useSpring } from "react-spring";

interface HRQuestionItemProps {
  question: Question;
  onAnswer: (answer: any) => void;
  autoFocus?: boolean;
  user: User;
  onFocusNext: (id?: number) => void;
  onFocusCurrent: (id?: number) => void;
}

export default function HRQuestionItem(props: HRQuestionItemProps) {
  const { question, onAnswer, user, autoFocus, onFocusCurrent, onFocusNext } =
    props;

  const router = useRouter();

  const [answer, setAnswer] = useState<any>(question.answer);
  const [showDescription, setShowDescription] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    setAnim({ opacity: 1, transform: "translateY(0)" });
  }, []);

  const [anim, setAnim] = useSpring(() => ({
    to: { opacity: 0, transform: "translateY(-20px)" },
    from: { opacity: 0, transform: "translateY(-20px)" },
    reset: true, // Reset the animation on mount
    onRest: () => {},
  }));

  const [skipAnim, setSkipAnim] = useSpring(() => ({
    opacity: 1,
    height: 40, // Assuming the button's height is 30px, adjust as needed
  }));

  const handleInfoClick = () => {
    setShowDescription(!showDescription); // Toggle the description visibility
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      if (inputRef.current) {
        inputRef.current.blur();
      }

      onFocusNext(question.id);
    }
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
            {question.question}
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
            {question.hrZoneDescription}
          </p>
        )}
        <input
          ref={inputRef}
          className={`w-full py-[9.5px] px-3 leading-tight border text-whitebg border-gray-700 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300 mr-2`}
          id="teamName"
          type="number"
          placeholder={question.placeholder}
          value={answer}
          onChange={(e) => {
            question.answer = e.target.value;
            setAnswer(e.target.value);
          }}
          autoFocus={autoFocus}
          onKeyDown={handleKeyPress}
        />
        {question.id !== 0 && (
          <animated.button
            style={skipAnim}
            className="font-bold px-4 text-sm rounded-lg mt-4 border transition duration-150 ease-in-out bg-black/50 text-whitebg hover:bg-gray-700 border-gray-700"
            onClick={() => {
              if (question.id === 11) {
                router.push("/blog/resting-heart-rate");
              } else {
                router.push("/blog/maximum-heart-rate");
              }
            }}
          >
            {question.id === 11
              ? "Find your resting heart rate"
              : "Find your max heart rate"}
          </animated.button>
        )}
      </div>
    </animated.div>
  );
}

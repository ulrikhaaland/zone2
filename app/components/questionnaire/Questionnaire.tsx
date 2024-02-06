"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  AnswerType,
  Question,
  questionnaireList,
} from "../../model/questionaire";
import QuestionItem from "./QuestionItem";
import { User } from "@/app/model/user";
import LogoutIcon from "@mui/icons-material/Logout";
import { useStore } from "@/RootStoreProvider";
import { useRouter } from "next/router";

const questionsFull: Question[] = questionnaireList;

interface QuestionnaireProps {
  onQuestCompleted: (questions: Question[]) => void;
  questions?: Question[];
  user: User;
  canSubmit?: (canSubmit: boolean) => void;
  isProfile: boolean;
}

export default function Questionnaire(props: QuestionnaireProps) {
  const { onQuestCompleted, user, canSubmit, isProfile } = props;

  const { authStore } = useStore();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>(
    props.questions && props.questions?.length !== 0
      ? props.questions
      : [questionsFull[0]]
  );
  const [completed, setCompleted] = useState(props.questions ? true : false);
  const [chosenExercise, setChosenExercise] = useState<string | undefined>();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false); // New state to track scrolling
  const [currentQuestionID, setCurrentQuestionID] = useState<number>(
    questions[questions.length - 1]?.id ?? 0
  );
  const [focusQuestionId, setFocusQuestionId] = useState(0);
  const [hasError, setHasError] = useState(false);

  const questionsRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const remainingQuestions =
    questionsFull[questionsFull.length - 1].id - currentQuestionID;

  const totalQuestions = currentQuestionID + remainingQuestions;
  const progressPercentage = (currentQuestionID / totalQuestions) * 100;

  useEffect(() => {
    if (!questions[questions.length - 1]) return;

    const currentId = questions[questions.length - 1].id;
    setCurrentQuestionID(currentId);

    if (currentId === questionsFull[questionsFull.length - 1].id) {
      handleOnQuestionAnswered(currentId);
    }

    if (
      !completed &&
      questions[questions.length - 1] ===
        questionsFull[questionsFull.length - 1]
    ) {
      setCompleted(true);

      if (canSubmit) {
        canSubmit(true);
      }

      handleSubmit(new Event("submit"));
    }
  }, [questions]);

  useEffect(() => {
    // Scroll to the bottom of the questions container whenever a new question is added
    if (questionsRef.current && !completed) {
      questionsRef.current.scrollTo({
        top: questionsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [questions, completed]);

  const handleScroll = () => {
    if (questionsRef.current) {
      const scrolled = questionsRef.current.scrollTop > 0;
      setIsScrolled(scrolled);

      // Clear existing timer
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      // Set scrolling to true
      setIsScrolling(true);

      // Set a timer to set scrolling to false after a delay
      scrollTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 50); // Delay of 500ms
    }
  };

  const handleOnQuestionAnswered = (questionId: number) => {
    // Find the index of the last answered question
    const currentQuestionIndex = questions.findIndex(
      (q) => q.id === questionId
    );

    const previousQuestion = questions[currentQuestionIndex - 1];

    let currentQuestion = questions[currentQuestionIndex];

    // handle chosen exercise
    if (currentQuestion.identifier === "exerciseModality") {
      setChosenExercise(currentQuestion.answer);
    }

    // has answered all questions

    if (previousQuestion) {
      if (currentQuestion.depensOnAnswer) {
        const questionsThatDependOnAnswer = questionsFull.filter(
          (q) => q.id === currentQuestion.id
        );
        if (questionsThatDependOnAnswer.length > 0) {
          for (let i = 0; i < questionsThatDependOnAnswer.length; i++) {
            const question = questionsThatDependOnAnswer[i];
            const answer = previousQuestion.answer;
            if (answer && question.depensOnAnswer === answer) {
              currentQuestion = question;
            }
          }
        }
      }
    }

    let currentQuestions = [...questions];

    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextQuestion = questionsFull.find(
        (q) => q.id === currentQuestion.id + 1
      )!;
      if (nextQuestion.depensOnAnswer) {
        currentQuestions = currentQuestions.filter((q) => {
          if (q.id <= currentQuestionIndex) {
            return true;
          } else {
            q.answer = undefined;
            return false;
          }
        });
      } else {
        return;
      }
    }

    // Add the next question to the list if it exists
    if (
      currentQuestionIndex >= 0 &&
      currentQuestion.id < questionsFull[questionsFull.length - 1].id
    ) {
      let nextQuestion = questionsFull.find((q) => q.id === questionId + 1)!;
      if (currentQuestion.jumpToQuestionId) {
        nextQuestion =
          questionsFull.find(
            (q) => q.id === currentQuestion.jumpToQuestionId
          ) || nextQuestion;
      } else if (nextQuestion.depensOnAnswer) {
        // remove all questions that has a bigger id than the current question
        currentQuestions = currentQuestions.filter(
          (q) => q.id <= currentQuestion.id
        );
        /// get all questions that has the id of nextQuestions
        // can be more than one
        const questionsThatDependOnAnswer = questionsFull.filter(
          (q) => q.id === nextQuestion.id
        );

        if (questionsThatDependOnAnswer.length > 0) {
          let found = false;
          for (let i = 0; i < questionsThatDependOnAnswer.length; i++) {
            const question = questionsThatDependOnAnswer[i];
            const answer = currentQuestion.answer;
            if (answer && question.depensOnAnswer === answer) {
              found = true;
              nextQuestion = question;
            }
          }
          if (!found) {
            nextQuestion = questionsFull.find(
              (q) => q.id === nextQuestion.id + 1
            )!;
          }
        }
      }

      // if currentQuestions contains the next question return
      if (currentQuestions.find((q) => q === nextQuestion)) {
        return;
      }
      if (completed) {
        setCompleted(false);
        canSubmit!(false);
      }
      nextQuestion.hasSkipped = false;
      setQuestions([...currentQuestions, nextQuestion]);
    } else {
      console.log("completed");
      onQuestCompleted(questions);
      setCompleted(true);
      handleSubmit(new Event("submit"));
    }
  };

  const handleSubmit = (event: any) => {
    let hasError = false;
    const currentQuestions = [...questions];
    let indexOfError;
    currentQuestions.forEach((question) => {
      if (question.hasError === true) {
        hasError = true;
        indexOfError = currentQuestions.indexOf(question);
      } else {
        question.hasError = false;
      }
    });

    if (hasError) {
      /// scroll to top
      questionsRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
      setHasError(true);
      if (canSubmit) {
        canSubmit(false);
      }
      return;
    }
    event.preventDefault();
    onQuestCompleted(questions);
  };

  return (
    <div
      className={`text-whitebg ${
        isProfile
          ? "bg-black bg-opacity-60 rounded-lg max-w-md md:min-h-[72.5dvh] md:max-h-[72.5dvh] min-h-[72.5dvh] max-h-[72.5dvh] md:border md:border-gray-700 md:rounded-lg"
          : "max-w-md md:min-h-[77.5dvh] md:max-h-[77.5dvh] min-h-[72.5dvh] max-h-[72.5dvh]"
      }`}
    >
      {/* Header with progress bar */}
      {!isProfile && (
        <div
          className={`relative md:p-4 pb-1 px-4 ${
            isScrolled ? "shadow-[0_8px_4px_-2px_rgba(0,0,0,0.3)]" : ""
          }`}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-gray-600 md:mt-0 mb-4">
            <div
              className="h-full bg-whitebg"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      {/* Scrollable questions section */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: isProfile ? "65dvh" : "70dvh" }}
        onScroll={handleScroll}
        ref={questionsRef} // Assign the ref to this div
      >
        {!isProfile && (
          <p
            className="text-3xl font-bold text-whitebg px-6"
            style={{
              textShadow: "10px 10px 10px rgba(0,0,0,1)",
            }}
          >
            Provide some information about yourself
          </p>
        )}
        <div className="p-6">
          {questions.map((question, index) => (
            <QuestionItem
              key={question.id.toString() + question.depensOnAnswer?.toString()}
              question={question}
              completed={completed}
              displayError={hasError && question.hasError === true}
              onAnswer={(val) => handleOnQuestionAnswered(question.id)}
              chosenExercise={chosenExercise?.toLowerCase()}
              user={user}
              isProfile={isProfile}
              onFocusCurrent={(id) => {
                if (id === questions[questions.length - 1].id) {
                  /// scroll to bottom
                  if (!completed)
                    questionsRef.current?.scrollTo({
                      top: questionsRef.current.scrollHeight,
                      behavior: "smooth",
                    });
                }
              }}
              onFocusNext={(previousId?: number) => {
                let id = questions[questions.length - 1].id;

                if (previousId) {
                  id = previousId + 1;
                }

                setFocusQuestionId(id);
                /// scroll to bottom
                if (!completed)
                  questionsRef.current?.scrollTo({
                    top: questionsRef.current.scrollHeight,
                    behavior: "smooth",
                  });
              }}
              autoFocus={
                !isScrolling && // Check if not scrolling
                (question.id === focusQuestionId ||
                  (index === questions.length - 1 &&
                    questions[questions.length - 2].answerType ===
                      AnswerType.SELECT) ||
                  (index === questions.length - 1 &&
                    questions[questions.length - 2].answerType ===
                      AnswerType.YES_NO))
              }
            />
          ))}
        </div>
        {isProfile && (
          <div className="flex justify-center">
            <button
              className={`flex items-center font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out 
              ${"bg-black text-whitebg border border-gray-700 transition duration-150 ease-in-out"} hover:bg-gray-900`}
              type="button"
              onClick={() => {
                authStore.signOut();
                router.push("/");
              }}
            >
              <LogoutIcon className="mr-2" style={{ color: "white" }} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

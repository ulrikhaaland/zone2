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

  const { authStore, generalStore } = useStore();
  const { isMobileView } = generalStore;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>(
    props.questions && props.questions?.length !== 0
      ? props.questions
      : [questionsFull[0]]
  );
  const [completed, setCompleted] = useState(
    props.questions &&
      props.questions.length > 10 &&
      props.questions[props.questions.length - 1].id === 14
      ? true
      : false
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolling = useRef<boolean>(false);

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
      onQuestCompleted(questions);

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
      isScrolling.current = true;

      // Set a timer to set scrolling to false after a delay
      scrollTimerRef.current = setTimeout(() => {
        isScrolling.current = false;
      }, 50); // Delay of 500ms
    }
  };

  const checkCompleted = () => {
    if (questions[questions.length - 1].id === 14) {
      let hasCompleted = true;
      questions.forEach((question) => {
        if (question.answer !== undefined || question.canSkip === true) {
        } else {
          hasCompleted = false;
        }
      });
      if (hasCompleted && completed) onQuestCompleted(questions);
    }
  };

  const handleOnQuestionAnswered = (questionId: number) => {
    checkCompleted();
    // Find the index of the last answered question
    const currentQuestionIndex = questions.findIndex(
      (q) => q.id === questionId
    );

    const previousQuestion = questions[currentQuestionIndex - 1];

    let currentQuestion = questions[currentQuestionIndex];

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
      if (
        nextQuestion.id === 12 &&
        nextQuestion.answer &&
        nextQuestion.answer !== ""
      ) {
        setQuestions([
          ...currentQuestions,
          nextQuestion,
          questionsFull.find((q) => q.id === 13)!,
        ]);
      } else {
        setQuestions([...currentQuestions, nextQuestion]);
      }
    } else {
      onQuestCompleted(questions);
      setCompleted(true);
      handleSubmit(new Event("submit"));
    }
  };

  const handleSubmit = (event: any) => {
    let hasError = false;
    const currentQuestions = [...questions];
    currentQuestions.forEach((question) => {
      if (question.hasError === true) {
        hasError = true;
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

  const signOutButton = (
    <div
      className={`flex justify-center ${
        isMobileView ? (!isProfile ? "mb-8" : "") : "pt-6"
      }`}
    >
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
  );

  return (
    <div
      className={`text-whitebg
      ${
        isProfile && !isMobileView
          ? `bg-black/50 rounded-lg max-w-md md:min-h-[83.5dvh] md:border md:border-gray-700 md:rounded-lg`
          : "max-w-md md:min-h-[70.5dvh]"
      }`}
    >
      {/* Header with progress bar */}
      {!isProfile && (
        <div
          className={`relative md:p-4 pb-1 px-4 ${
            isScrolled ? "shadow-[0_8px_4px_-2px_rgba(0,0,0,0.3)]" : ""
          }`}
        >
          {/* Current question / Remaining Questions */}
          <p className="mb-2">
            {currentQuestionID +
              1 +
              "/" +
              (questionsFull.length - 1).toString() +
              " " +
              "Questions"}
          </p>
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
        className={`overflow-y-auto`}
        style={{
          maxHeight: !isMobileView
            ? isProfile
              ? "74dvh"
              : "66.5dvh"
            : isProfile
            ? "calc(100dvh - 130px)"
            : "calc(100dvh - 160px)",
        }}
        onScroll={handleScroll}
        ref={questionsRef} // Assign the ref to this div
      >
        {!isProfile && (
          <p
            className="text-3xl font-bold text-whitebg px-4"
            style={{
              textShadow: "10px 10px 10px rgba(0,0,0,1)",
            }}
          >
            Provide some information about yourself
          </p>
        )}
        <div className={`p-4 ${isMobileView && !isProfile && "mb-12"}`}>
          {questions.map((question, index) => (
            <QuestionItem
              key={question.id.toString() + question.depensOnAnswer?.toString()}
              question={question}
              completed={completed}
              isMobileView={isMobileView}
              displayError={hasError && question.hasError === true}
              onAnswer={(val) => handleOnQuestionAnswered(question.id)}
              chosenExercise={questions
                .find((q) => q.id === 9)
                ?.answer?.toLowerCase()}
              user={user}
              hasNext={index < questions.length - 1}
              isProfile={isProfile}
              onFocusCurrent={(id) => {
                if (id === questions[questions.length - 1].id) {
                  /// scroll to bottom
                  if (!completed)
                    questionsRef.current?.scrollTo({
                      top: questionsRef.current.scrollHeight,
                      behavior: "instant",
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
                !isScrolling.current && // Check if not scrolling
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
      </div>
      {isProfile && isMobileView && (
        <div className="fixed w-full bottom-3 left-0 right-0">
          {signOutButton}
        </div>
      )}
      {isProfile && !isMobileView && (
        <div className="flex justify-center items-center text-center">
          {signOutButton}
        </div>
      )}
    </div>
  );
}

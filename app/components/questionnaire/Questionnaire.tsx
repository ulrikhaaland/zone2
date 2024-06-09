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

const isCompletedInitial = (questions?: Question[]): boolean => {
  return questions
    ? questions.length > 10 && questions[questions.length - 1].id === 14
    : false;
};

export default function Questionnaire(props: QuestionnaireProps) {
  const { onQuestCompleted, user, canSubmit, isProfile } = props;
  const { authStore, generalStore } = useStore();
  const { isMobileView } = generalStore;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>(
    props.questions?.length ? props.questions : [questionsFull[0]]
  );
  const [completed, setCompleted] = useState<boolean>(
    isCompletedInitial(props.questions)
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
    if (questions[questions.length - 1]) {
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
    }
  }, [questions]);

  useEffect(() => {
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

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      isScrolling.current = true;

      scrollTimerRef.current = setTimeout(() => {
        isScrolling.current = false;
      }, 50);
    }
  };

  const checkCompleted = () => {
    if (questions[questions.length - 1].id === 14) {
      const hasCompleted = questions.every(
        (question) => question.answer !== undefined || question.canSkip === true
      );
      if (hasCompleted && completed) onQuestCompleted(questions);
    }
  };

  const handleOnQuestionAnswered = (questionId: number) => {
    checkCompleted();
    const currentQuestionIndex = questions.findIndex(
      (q) => q.id === questionId
    );
    const previousQuestion = questions[currentQuestionIndex - 1];
    let currentQuestion = questions[currentQuestionIndex];

    if (previousQuestion && currentQuestion.depensOnAnswer) {
      const dependentQuestions = questionsFull.filter(
        (q) => q.id === currentQuestion.id
      );
      currentQuestion =
        dependentQuestions.find(
          (q) => q.depensOnAnswer === previousQuestion.answer
        ) || currentQuestion;
    }

    let currentQuestions = [...questions];

    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextQuestion = questionsFull.find(
        (q) => q.id === currentQuestion.id + 1
      );
      if (nextQuestion?.depensOnAnswer) {
        currentQuestions = currentQuestions.filter(
          (q) => q.id <= currentQuestionIndex
        );
      } else {
        return;
      }
    }

    addNextQuestion(currentQuestionIndex, currentQuestion, currentQuestions);
  };

  const addNextQuestion = (
    currentQuestionIndex: number,
    currentQuestion: Question,
    currentQuestions: Question[]
  ) => {
    if (
      currentQuestionIndex >= 0 &&
      currentQuestion.id < questionsFull[questionsFull.length - 1].id
    ) {
      let nextQuestion = questionsFull.find(
        (q) => q.id === currentQuestion.id + 1
      )!;
      if (currentQuestion.jumpToQuestionId) {
        nextQuestion =
          questionsFull.find(
            (q) => q.id === currentQuestion.jumpToQuestionId
          ) || nextQuestion;
      } else if (nextQuestion.depensOnAnswer) {
        currentQuestions = currentQuestions.filter(
          (q) => q.id <= currentQuestion.id
        );
        const dependentQuestions = questionsFull.filter(
          (q) => q.id === nextQuestion.id
        );
        nextQuestion =
          dependentQuestions.find(
            (q) => q.depensOnAnswer === currentQuestion.answer
          ) || nextQuestion;
      }

      if (!currentQuestions.includes(nextQuestion)) {
        nextQuestion.hasSkipped = false;
        if (nextQuestion.id === 12 && nextQuestion.answer) {
          setQuestions([
            ...currentQuestions,
            nextQuestion,
            questionsFull.find((q) => q.id === 13)!,
          ]);
        } else {
          setQuestions([...currentQuestions, nextQuestion]);
        }
      }
    } else {
      onQuestCompleted(questions);
      setCompleted(true);
      handleSubmit(new Event("submit"));
    }
  };

  const handleSubmit = (event: any) => {
    let hasError = false;
    questions.forEach((question) => {
      if (question.hasError) {
        hasError = true;
      } else {
        question.hasError = false;
      }
    });

    if (hasError) {
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
      className={`text-whitebg ${
        isProfile && !isMobileView
          ? `bg-black/50 rounded-lg max-w-md md:min-h-[83.5dvh] md:border md:border-gray-700 md:rounded-lg`
          : "max-w-md md:min-h-[70.5dvh]"
      }`}
    >
      {!isProfile && (
        <div
          className={`relative md:p-4 pb-1 px-4 ${
            isScrolled ? "shadow-[0_8px_4px_-2px_rgba(0,0,0,0.3)]" : ""
          }`}
        >
          <div className="h-1 bg-gray-600 md:mt-0 mb-4">
            <div
              className="h-full bg-whitebg"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      <div
        className={`overflow-y-auto`}
        style={{
          maxHeight: !isMobileView
            ? isProfile
              ? "74dvh"
              : "70dvh"
            : isProfile
            ? "calc(100dvh - 130px)"
            : "calc(100dvh - 160px)",
        }}
        onScroll={handleScroll}
        ref={questionsRef}
      >
        {!isProfile && (
          <p
            className="text-3xl font-bold text-whitebg px-4"
            style={{ textShadow: "10px 10px 10px rgba(0,0,0,1)" }}
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
                if (id === questions[questions.length - 1].id && !completed) {
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
                if (!completed) {
                  questionsRef.current?.scrollTo({
                    top: questionsRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                }
              }}
              autoFocus={
                !isScrolling.current &&
                (question.id === focusQuestionId ||
                  (index === questions.length - 1 &&
                    [AnswerType.SELECT, AnswerType.YES_NO].includes(
                      questions[questions.length - 2]?.answerType
                    )))
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

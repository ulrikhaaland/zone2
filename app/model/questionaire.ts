import {
  HeartRateZone,
  calculateHeartRateZones,
  zoneDescriptions,
} from "../utils/HRZonesCalculator";
import { FitnessLevel, FitnessData } from "./user";

export interface Question {
  id: number;
  identifier?: string;
  question: string;
  answerType: AnswerType;
  answer?: any;
  depensOnAnswer?: any;
  availableAnswers?: string[];
  canSkip?: boolean;
  hasSkipped?: boolean;
  description: string;
  hrZoneDescription?: string;
  jumpToQuestionId?: number;
  placeholder?: string;
  hasError?: boolean;
}

export enum AnswerType {
  YES_NO = "YES_NO",
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  SELECT = "SELECT",
}

export const cardioFrequencyAnswers = ["Less than 1", "1-2", "3 or more"];

export const zone2FrequencyAnswers = ["2", "3", "4 or more"];

export const questionnaireList: Question[] = [
  {
    id: 0,
    question: "How old are you?",
    answerType: AnswerType.NUMBER,
    identifier: "age",
    description:
      "Your age helps us tailor an exercise program that's appropriate for your life stage, considering factors like metabolism, recovery time, and exercise capacity.",
    hrZoneDescription:
      "If you don't know your resting and maximal heart rate we will use your age to calculate your heart rate zones.",
    placeholder: "Enter your age",
  },
  {
    id: 1,
    question: "What's your height?",
    answerType: AnswerType.NUMBER,
    canSkip: true,
    identifier: "height",
    description:
      "Your height, combined with your weight, will be used to calculate your Body Mass Index (BMI), which gives us an insight into your overall health and helps in planning your exercise regimen.",
    placeholder: "Enter your height in cm",
  },
  {
    id: 2,
    question: "What's your weight?",
    answerType: AnswerType.NUMBER,
    canSkip: true,
    identifier: "weight",
    description:
      "Knowing your weight, along with your height, allows us to calculate your BMI. This information is crucial for designing a safe and effective exercise program, particularly if it involves weight management.",
    placeholder: "Enter your weight in kg",
  },
  {
    id: 3,
    question: "What is your motivation for doing zone 2 training?",
    answerType: AnswerType.SELECT,
    availableAnswers: ["Weight loss", "Improve health", "Improve performance"],
    identifier: "goal",
    description:
      "Understanding your primary goal for Zone 2 training—be it weight loss, health improvement, or performance enhancement—enables us to focus your program on achieving these specific outcomes.",
  },
  {
    id: 4,
    question: "Do you exercise?",
    answerType: AnswerType.YES_NO,
    identifier: "doesExercise",
    description:
      "This question helps us gauge your current level of physical activity, which is essential for creating a fitness plan that either kick-starts your exercise journey or builds on your existing routine.",
  },
  {
    id: 5,
    depensOnAnswer: "yes",
    question: "Do you lift weights?",
    answerType: AnswerType.YES_NO,
    identifier: "doesWeightTraining",
    description:
      "Knowing if you engage in weight training informs us about your overall fitness regime and strength, helping us integrate or adjust strength training in your personalized program.",
  },
  {
    id: 5,
    depensOnAnswer: "no",
    question:
      "Do you walk regularly (more than once a week) for at least 30 minutes?",
    answerType: AnswerType.YES_NO,
    jumpToQuestionId: 8,
    identifier: "doesWalk",
    description:
      "Your walking habits give us an indication of your basic fitness and cardiovascular health. This information is particularly useful if you're not currently engaged in a structured exercise routine.",
  },
  {
    id: 6,
    question: "Do you do cardio?",
    answerType: AnswerType.YES_NO,
    identifier: "doesCardio",
    description:
      "Understanding whether you perform cardio exercises and the regularity of such activities helps us assess your cardiovascular fitness and endurance, which are key to customizing your Zone 2 exercise plan.",
  },
  {
    id: 7,
    depensOnAnswer: "yes",
    question: "In the last year, how many times a week have you done cardio?",
    answerType: AnswerType.SELECT,
    availableAnswers: cardioFrequencyAnswers,
    identifier: "cardioFrequency",
    description:
      "This question aims to gauge the frequency of your cardiovascular activities, allowing us to tailor the intensity and type of your Zone 2 exercises effectively, avoiding overtraining and ensuring progress.",
  },
  {
    id: 8,
    question: "How many days a week can you allocate to zone 2 exercise?",
    answerType: AnswerType.SELECT,
    availableAnswers: zone2FrequencyAnswers,
    identifier: "daysAvailableForZone2",
    description:
      "Letting us know how many days you can dedicate to Zone 2 exercise helps us create a realistic and manageable exercise schedule, which is crucial for maintaining consistency and achieving long-term goals.",
  },
  {
    id: 9,
    question: "Which exercise modality do you prefer for zone 2?",
    answerType: AnswerType.SELECT,
    availableAnswers: [
      "Walking",
      "Running",
      "Cycling",
      "Swimming",
      "Stairmaster",
      "Elliptical",
      "Rowing",
    ],
    identifier: "exerciseModality",
    description:
      "Your preference in exercise modality ensures that you enjoy the activity, increasing the likelihood of adherence and consistent engagement in your Zone 2 training program.",
  },
  {
    id: 10,
    question:
      "Do you prefer doing the [chosen exercise] indoors, outdoors, or both?",
    answerType: AnswerType.SELECT,
    availableAnswers: ["Indoors", "Outdoors", "Both"],
    identifier: "indoorOutdoorBoth",
    description:
      "Knowing your preference for indoor or outdoor exercise helps us tailor your workout experience, enhancing your comfort and motivation during your training sessions.",
  },
  {
    id: 11,
    question: "What is your resting heart rate?",
    answerType: AnswerType.NUMBER,
    canSkip: true,
    identifier: "restingHeartRate",
    description:
      "Your resting heart rate is a key indicator of your cardiovascular health and fitness level. It helps us tailor the intensity of your exercises and monitor your improvements over time.",
    hrZoneDescription:
      "Your resting heart rate, or pulse, is the number of times your heart beats per minute when you are at rest — such as when you are relaxed, sitting or lying down.",
    placeholder: "Enter your resting heart rate in bpm",
  },
  {
    id: 12,
    question: "What is your max heart rate?",
    answerType: AnswerType.NUMBER,
    canSkip: true,
    identifier: "maxHeartRate",
    description:
      "Knowing your maximum heart rate is crucial for calculating the appropriate heart rate zones for your training, especially in cardiovascular exercises like Zone 2 training.",
    hrZoneDescription:
      "Your maximum heart rate is the highest heart rate you can achieve during maximal or exhaustive exercise.",
    placeholder: "Enter your max heart rate in bpm",
  },
  {
    id: 13,
    question: "Do you have a smart watch?",
    answerType: AnswerType.YES_NO,
    identifier: "hasHeartRateMonitor",
    description:
      "If you have a heart rate monitoring device, such as a smart watch, it allows for precise guidance in heart rate-based training and effective tracking of your progress.",
  },
  {
    id: 14,
    question: "Additional information",
    answerType: AnswerType.TEXT,
    canSkip: true,
    identifier: "additionalInformation",
    description: "Feel free to share anything else that you think is relevant.",
    placeholder: "E.G I have a knee injury",
  },
];

export function questToFitnessData(answers: Question[]): FitnessData {
  const age = answers.find((q) => q.identifier === "age")!.answer;
  const height = answers.find((q) => q.identifier === "height")!.answer;
  const weight = answers.find((q) => q.identifier === "weight")!.answer;
  // calculate bmi
  let bmi;
  if (height && weight) {
    bmi = Number((weight / ((height / 100) * (height / 100))).toFixed(0));
  } else {
    bmi = undefined;
  }
  const goal = answers.find((q) => q.identifier === "goal")!.answer;

  // Define fitness level
  let fitnessLevel: FitnessLevel;

  const doesWeightTraining =
    answers.find((q) => q.identifier === "doesWeightTraining")?.answer ===
    "yes";
  const doesExercise: boolean =
    answers.find((q) => q.identifier === "doesExercise")!.answer === "yes";
  let doesCardio: boolean =
    answers.find((q) => q.identifier === "doesCardio")?.answer === "yes";

  let currentAverageWeeklyCardio: number | undefined = undefined;

  if (doesExercise) {
    if (doesCardio) {
      const cardioFreqQuestion: Question = answers.find(
        (q) => q.identifier === "cardioFrequency"
      )!;

      const cardioFrequency: string = cardioFreqQuestion.answer;

      if (cardioFrequency === cardioFreqQuestion.availableAnswers![0]) {
        fitnessLevel = FitnessLevel.BEGINNER;
        currentAverageWeeklyCardio = 0;
      } else {
        if (cardioFrequency === cardioFreqQuestion.availableAnswers![1])
          currentAverageWeeklyCardio = 1;
        else currentAverageWeeklyCardio = 2;
        fitnessLevel = FitnessLevel.ACTIVE;
      }
    } else {
      fitnessLevel = FitnessLevel.BEGINNER;
    }
  } else {
    const walksRegularly: boolean =
      answers.find((q) => q.identifier === "doesWalk")!.answer === "yes";

    if (walksRegularly) {
      fitnessLevel = FitnessLevel.BEGINNER;
    } else {
      fitnessLevel = FitnessLevel.SEDENTARY;
    }
  }

  let numberOfDaysAvailableForZone2: number = 0;

  const daysAvailableQuestion: Question = answers.find(
    (q) => q.identifier === "daysAvailableForZone2"
  )!;

  if (
    daysAvailableQuestion.answer === daysAvailableQuestion.availableAnswers![0]
  ) {
    numberOfDaysAvailableForZone2 = 0;
  } else if (
    daysAvailableQuestion.answer === daysAvailableQuestion.availableAnswers![1]
  ) {
    numberOfDaysAvailableForZone2 = 1;
  } else {
    numberOfDaysAvailableForZone2 = 2;
  }

  // Define exercise modality
  const exerciseModality: string = answers.find(
    (q) => q.identifier === "exerciseModality"
  )!.answer;
  const indoorOutdoorBoth: string = answers.find(
    (q) => q.identifier === "indoorOutdoorBoth"
  )!.answer;

  // Define heart rate
  const restingHeartRate: number | undefined = answers.find(
    (q) => q.identifier === "restingHeartRate"
  )!.answer;
  const maxHeartRate: number | undefined = answers.find(
    (q) => q.identifier === "maxHeartRate"
  )!.answer;
  const hasHeartRateMonitor: boolean =
    answers.find((q) => q.identifier === "hasHeartRateMonitor")!.answer ===
    "yes";

  // calculate heart rate zones
  let heartRateZones: HeartRateZone[] | undefined = undefined;
  let zone2HeartRateRange: HeartRateZone | undefined = undefined;
  if (maxHeartRate && restingHeartRate) {
    heartRateZones = calculateHeartRateZones(
      undefined,
      Number(maxHeartRate),
      Number(restingHeartRate)
    );
    zone2HeartRateRange = heartRateZones[1];
  } else {
    zone2HeartRateRange = {
      name: "Zone 2",
      lowerLimit: 168 - age,
      upperLimit: 180 - age,
      description: zoneDescriptions[1],
    };
  }

  let additionalInformation: string | undefined = undefined;

  const addAnswer = answers.find(
    (q) => q.identifier === "additionalInformation"
  )?.answer;

  if (addAnswer !== "" && addAnswer !== undefined) {
    additionalInformation = addAnswer;
  }

  return {
    age: age,
    height: height,
    weight: weight,
    bmi: bmi,
    goal: goal,
    doesCardio: doesCardio,
    doesWeightTraining: doesWeightTraining,
    doesOther: doesExercise && !doesCardio && !doesWeightTraining,
    fitnessLevel: fitnessLevel,
    maxHeartRate: maxHeartRate,
    restingHeartRate: restingHeartRate,
    exerciseModality: exerciseModality as any,
    numberOfDaysAvailableForZone2: numberOfDaysAvailableForZone2,
    currentAverageWeeklyCardio: currentAverageWeeklyCardio,
    indoorOutdoorBoth: indoorOutdoorBoth,
    hasHeartRateMonitor: hasHeartRateMonitor,
    zone2HeartRateRange: {
      name: zone2HeartRateRange.name,
      lowerLimit: zone2HeartRateRange.lowerLimit,
      upperLimit: zone2HeartRateRange.upperLimit,
    },
    additionalInformation: additionalInformation,
  };
}

// import firebase user
import * as firebaseAuth from "firebase/auth";
import { HeartRateZone } from "../utils/HRZonesCalculator";
import { GuideItem} from "./guide";
import {
  Question,
  cardioFrequencyAnswers,
  zone2FrequencyAnswers,
} from "./questionaire";

export enum GuideStatus {
  NONE = "NONE",
  // Gets free guide
  FREEBIE = "FREEBIE",
  HASPAID = "HASPAID",
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

export interface User {
  firebaseUser?: firebaseAuth.User;
  guideItems: GuideItem[];
  previousGuideItems?: GuideItem[];
  fitnessData?: FitnessData;
  heartRateZones?: HeartRateZone[];
  questions: Question[];
  usesKG: boolean;
  usesCM: boolean;
  uid: string;
  credits: number;
  hasPaid?: boolean;
  guideStatus?: GuideStatus;
  retries?: number;
  guideGenerationThreadId?: string;
  guideGenerationRunId?: string;
  hasReviewed?: boolean;
  hasDeclinedReview?: boolean;
}

export interface FitnessData {
  age: number;
  height?: number;
  weight?: number;
  bmi?: number;
  goal: Goal;
  doesCardio: boolean;
  doesWeightTraining: boolean;
  // yoga, pilates, walking etc.
  doesOther: boolean;
  fitnessLevel: FitnessLevel;
  maxHeartRate?: number;
  restingHeartRate?: number;
  exerciseModality: ExerciseModality;
  // Available time for zone 2
  numberOfDaysAvailableForZone2: number;
  currentAverageWeeklyCardio?: number;
  indoorOutdoorBoth: string;
  // can live-track heart rate
  hasHeartRateMonitor: boolean;
  // minutes per week
  heartRateZones?: HeartRateZone[];
  zone2HeartRateRange: any;
  additionalInformation?: string;
}

// create function fitness data to json where i can modify the data
export function fitnessDataToJson(fitnessData: FitnessData): string {
  const data = JSON.stringify({
    age: fitnessData.age,
    height: fitnessData.height ? fitnessData.height.toString() + "cm" : null,
    weight: fitnessData.weight ? fitnessData.weight.toString() + "kg" : null,
    bmi: fitnessData.bmi,
    goal: fitnessData.goal,
    doesCardio: fitnessData.doesCardio,
    doesWeightTraining: fitnessData.doesWeightTraining,
    doesOther: fitnessData.doesOther,
    fitnessLevel: fitnessData.fitnessLevel,
    maxHeartRate: fitnessData.maxHeartRate,
    restingHeartRate: fitnessData.restingHeartRate,
    exerciseModality: fitnessData.exerciseModality,
    numberOfDaysAvailableForZone2:
      zone2FrequencyAnswers[fitnessData.numberOfDaysAvailableForZone2],
    currentAverageWeeklyCardio: fitnessData.currentAverageWeeklyCardio
      ? cardioFrequencyAnswers[fitnessData.currentAverageWeeklyCardio]
      : 0,
    indoorOutdoorBoth: fitnessData.indoorOutdoorBoth,
    hasHeartRateMonitor: fitnessData.hasHeartRateMonitor,
    zone2HeartRateRange: fitnessData.zone2HeartRateRange,
  });
  return data;
}

export enum ExerciseModality {
  WALKING = "WALKING",
  RUNNING = "RUNNING",
  CYCLING = "CYCLING",
  SWIMMING = "SWIMMING",
  STAIRMASTER = "STAIRMASTER",
  ELLIPTICAL = "ELLIPTICAL",
  ROWING = "ROWING",
}

export enum Goal {
  WEIGHTLOSS = "WEIGHTLOSS",
  HEALTH = "IMPROVE HEALTH",
  PERFORMANCE = "IMPROVE PERFORMANCE",
}

export enum FitnessLevel {
  // never exercised
  SEDENTARY = "Sedentary",
  // exercises occasionally, but never consistently, or walks regularly
  BEGINNER = "Beginner",
  // exercises consistently, but not specificaly
  ACTIVE = "Active",
  // exercises consistently, and specifically
  ADVANCED = "Advanced",
}

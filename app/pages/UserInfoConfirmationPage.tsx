import React from "react";
import { FitnessData, User } from "../model/user";
import {
  cardioFrequencyAnswers,
  zone2FrequencyAnswers,
} from "../model/questionaire";
import { AiOutlineArrowLeft } from "react-icons/ai";

// Conversion constants
const CM_TO_FEET = 0.0328084;
const KG_TO_LBS = 2.20462;

interface UserInfoConfirmationProps {
  fitnessData: FitnessData;
  user: User;
}

export default function UserInfoConfirmationPage(
  props: UserInfoConfirmationProps
) {
  const { fitnessData, user } = props;

  // Convert height from cm to feet and inches
  const convertHeightToFeet = (heightInCm: number) => {
    const heightInFeet = heightInCm * CM_TO_FEET;
    const feet = Math.floor(heightInFeet);
    const inches = Math.round((heightInFeet - feet) * 12);

    return `${feet}' ${inches}"`;
  };

  // Convert weight from kg to lbs
  const convertWeightToLbs = (weightInKg: number) => {
    return Math.round(weightInKg * KG_TO_LBS);
  };

  const getHeight = () => {
    if (fitnessData.height === undefined) return "Undefined";
    else
      return user.usesCM
        ? `${fitnessData.height} cm`
        : convertHeightToFeet(Number(fitnessData.height));
  };

  const getWeight = () => {
    if (fitnessData.weight === undefined) return "Undefined";
    else
      return user.usesKG
        ? `${fitnessData.weight} kg`
        : `${convertWeightToLbs(fitnessData.weight)} lbs`;
  };

  const getExerciseEnvironment = () => {
    const environment = fitnessData.indoorOutdoorBoth;

    if (environment === "indoor") return "Indoor";
    else if (environment === "outdoor") return "Outdoor";
    else return "Indoors & Outdoors";
  };

  return (
    <div
      className="text-whitebg md:min-h-[77.5dvh] md:max-h-[77.5dvh] min-h-[72.5dvh] max-h-[72.5dvh]"
      style={{
        textShadow: "10px 10px 10px rgba(0,0,0,1)",
      }}
    >
      {/* Header */}
      <div className="relative p-6 ">
        <h1 className="text-3xl font-bold">Confirm your information</h1>
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto p-6"
        style={{ minHeight: "65dvh", maxHeight: "65dvh" }}
      >
        {/* Display each piece of fitness data */}
        <p className="mb-2">Age: {fitnessData.age}</p>
        {fitnessData.height && <p className="mb-2">Height: {getHeight()}</p>}
        {fitnessData.weight && <p className="mb-2">Weight: {getWeight()}</p>}
        {fitnessData.height && fitnessData.weight && (
          <p className="mb-2">BMI: {fitnessData.bmi ?? "Undefined"}</p>
        )}
        <p className="mb-2">Goal: {fitnessData.goal}</p>
        <p className="mb-2">
          Does Cardio: {fitnessData.doesCardio ? "Yes" : "No"}
        </p>
        {fitnessData.doesCardio && (
          <p className="mb-2">
            Average Weekly Cardio:{" "}
            {cardioFrequencyAnswers[fitnessData.currentAverageWeeklyCardio!] ??
              "N/A"}
          </p>
        )}
        <p className="mb-2">
          Does Weight Training: {fitnessData.doesWeightTraining ? "Yes" : "No"}
        </p>
        <p className="mb-2">
          Exercise Modality: {fitnessData.exerciseModality}
        </p>
        {fitnessData.indoorOutdoorBoth && (
          <p className="mb-2">
            Exercise Environment: {getExerciseEnvironment()}
          </p>
        )}
        <p className="mb-2">
          Days Available for Zone 2:{" "}
          {zone2FrequencyAnswers[fitnessData.numberOfDaysAvailableForZone2]}{" "}
          {" days"}
        </p>{" "}
        {fitnessData.restingHeartRate && (
          <p className="mb-2">
            Resting Heart Rate: {fitnessData.restingHeartRate ?? "Undefined"}{" "}
            {" bpm"}
          </p>
        )}
        {fitnessData.maxHeartRate && (
          <p className="mb-2">
            Max Heart Rate: {fitnessData.maxHeartRate ?? "Undefined"} {" bpm"}
          </p>
        )}
        <p className="mb-2">
          Has Heart Rate Monitor:{" "}
          {fitnessData.hasHeartRateMonitor ? "Yes" : "No"}
        </p>
        {fitnessData.additionalInformation && (
          <div className="mb-2">
            <span className="block mb-1">Additional Information:</span>
            <div className="bg-gray-100 p-2 rounded-md">
              <p className="whitespace-pre-line text-sm">
                {fitnessData.additionalInformation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

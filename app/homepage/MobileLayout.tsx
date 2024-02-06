import React, { ReactElement, RefObject } from "react";
import Image from "next/image";
import { CircularProgress } from "@mui/material";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { User } from "../model/user";

// Define the props interface
interface HomeMobileLayoutProps {
  isMuted: boolean;
  isPlaying: boolean;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  emailSent: boolean;
  loading: boolean;
  message: string;
  videoRef: RefObject<HTMLVideoElement>;
  emailInputRef: RefObject<HTMLInputElement>;
  toggleSound: () => void;
  togglePlay: () => void;
  handleClick: React.MouseEventHandler<HTMLDivElement>;
  handleSendLink: (e: React.FormEvent<HTMLFormElement>) => void;
  user?: User; // Define a more specific type if available
}

export const HomeMobileLayout: React.FC<HomeMobileLayoutProps> = ({
  isMuted,
  isPlaying,
  email,
  setEmail,
  emailSent,
  loading,
  message,
  videoRef,
  emailInputRef,
  toggleSound,
  togglePlay,
  handleClick,
  handleSendLink,
  user,
}) => {
  return (
    <div
      className="relative h-screen w-full "
      onClick={handleClick}
      tabIndex={0}
    >
      {/* Adjusted video container for mobile */}
      <div className="absolute inset-0 z-0 ">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          className="w-full h-screen object-cover"
        >
          <source
            src="https://firebasestorage.googleapis.com/v0/b/zone2program-a24ce.appspot.com/o/zone2small.mp4?alt=media&token=2ed6320e-bb96-402e-9700-3ba1028a8111"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black opacity-50" />
      </div>

      {/* Content container adjusted for mobile */}
      <div
        className="relative z-10 p-4 mx-auto w-full pt-24"
        style={{
          textShadow: "10px 10px 10px rgba(0,0,0,1)",
        }}
      >
        {/* Expert Testimonials */}
        <div className="text-white mb-4 py-2">
          <h2 className="text-2xl font-bold">Tailored To Your Fitness Level</h2>
          <p>
            A comprehensive guide to Zone 2 training, featuring Dr. Peter Attia
            and Dr. Iñigo San Millán&apos;s insights.
          </p>
        </div>

        {/* Simplified content section */}
        <div>
          <div className="bg-black bg-opacity-60 p-4 rounded-lg">
            <h1 className="text-3xl font-bold text-white mb-4">
              Your Tailored Guide to Zone 2
            </h1>
            <p className="text-sm text-white mb-2">
              Discover the science behind Zone 2 training tailored to your
              fitness level.
            </p>
            {/* Condensed includes section */}
            <ul className="list-disc list-inside text-sm text-white">
              <li>Your Expected Benefits</li>
              <li>Effective Exercise Duration, Frequency & Dose</li>
              <li>Methods For Determining Zone 2 Intensity</li>
              <li>Your Heart Rate Zones</li>
              <li>What To Think About During Zone 2 Training</li>
              <li>Realistic Goals & Expectations</li>
              <li>Recovery & Preventing Overtraining</li>
            </ul>
          </div>

          {/* Sign-up box adjusted for mobile */}
          {!user && (
            <div className="bg-black bg-opacity-60 p-4 rounded-lg mt-4">
              {emailSent ? (
                <p className="text-green-500 text-center">
                  Check your email for the sign-in link.
                </p>
              ) : (
                <form onSubmit={handleSendLink} className="space-y-4">
                  <input
                    ref={emailInputRef}
                    type="email"
                    className="w-full p-2 text-white bg-black border-2 border-gray-700 rounded-lg"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-800 text-white p-2 rounded-lg"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Start Training"}
                  </button>
                </form>
              )}
              {message && (
                <p
                  className={`mt-4 text-center ${
                    emailSent ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Adjust buttons for mobile */}
      <div className="z-100 absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSound();
          }}
          className="bg-gray-700 p-2 rounded-full"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="bg-gray-700 p-2 rounded-full"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </button>
      </div>
    </div>
  );
};

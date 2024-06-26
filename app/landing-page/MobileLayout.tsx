import React, { ReactElement, RefObject } from "react";
import Image from "next/image";
import { CircularProgress } from "@mui/material";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { User } from "../model/user";

const videoLinkTopText =
  "https://firebasestorage.googleapis.com/v0/b/zone2program-a24ce.appspot.com/o/zone2small3.mp4?alt=media&token=364e25ae-bd36-4534-93b5-2ccfd9fc5fd2";
const videoLinkBottomText =
  "https://firebasestorage.googleapis.com/v0/b/zone2program-a24ce.appspot.com/o/zone2small.mp4?alt=media&token=2ed6320e-bb96-402e-9700-3ba1028a8111";

// Define the props interface
interface HomeMobileLayoutProps {
  isMuted: boolean;
  isPlaying: boolean;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  emailSent: boolean;
  loading: boolean;
  isSignupLink: boolean;
  message: string;
  videoRef: RefObject<HTMLVideoElement>;
  emailInputRef: RefObject<HTMLInputElement>;
  toggleSound: () => void;
  togglePlay: () => void;
  handleClick: React.MouseEventHandler<HTMLDivElement>;
  handleSendLink: (e: React.FormEvent<HTMLFormElement>) => void;
  user?: User; // Define a more specific type if available
  handleVideoPlay: () => void;
  canPlayVideo: boolean;
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
  isSignupLink,
  handleVideoPlay,
  canPlayVideo,
}) => {
  return (
    <div className="relative w-full h-full" onClick={handleClick}>
      {/* Adjusted video container for mobile */}
      {canPlayVideo && (
        <div className="absolute inset-0 z-0 ">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline // Add playsInline to avoid fullscreen mode on play in iOS
            controls={false} // Add this to disable default controls and prevent opening in video viewer
            onClick={(e) => e.preventDefault()} // Optionally prevent default action on click
            onPlay={handleVideoPlay}
            className="w-full h-full object-cover"
          >
            <source src={videoLinkBottomText} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black opacity-70" />
        </div>
      )}

      {/* Content container adjusted for mobile */}
      <div
        className={`absolute top-0 left-0 right-0 bottom-0 z-10 px-4 pt-2 mx-auto overflow-auto 
        `}
        style={{
          textShadow: "10px 10px 10px rgba(0,0,0,1)",
          height: user ? "calc(100dvh - 50px)" : "100dvh",
          marginTop: user ? "50px" : "",
        }}
      >
        {/* Simplified content section */}
        <div>
          <div className="py-4">
            <h1 className="text-3xl font-bold text-white mb-4">
              Your Personalized Guide to Zone 2 Training
            </h1>
            <p className="text-l text-white mb-2">
              Uncovers the scientific details behind Zone 2 training and applies
              them to your fitness level.
            </p>
            <h2 className="text-2xl font-bold text-whitebg mb-2">Includes:</h2>
            {/* Condensed includes section */}
            <ul
              className="list-disc list-inside text-sm text-white"
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              <li>Your Expected Benefits</li>
              <li>Effective Exercise Duration, Frequency & Dose</li>
              <li>Methods For Determining Zone 2 Intensity</li>
              <li>Your Zone 2 Heart Rate</li>
              <li>What To Think About During Zone 2 Training</li>
              <li>Realistic Goals & Expectations</li>
              <li>Recovery & Preventing Overtraining</li>
            </ul>
            {/* Bottom content with laurel */}
            <div
              className="relative text-center mt-4 h-[100px] flex flex-col justify-center items-center"
              style={{ minWidth: "300px" }}
            >
              <p className="text-sm text-white w-[205px]">
                Based Upon The Recommendations of Dr. PETER ATTIA & Dr. IÑIGO
                SAN MILLÁN
              </p>
              <Image
                src="/assets/laurel.svg"
                alt="Laurel"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                width={295}
                height={50}
              />
            </div>
          </div>
          {/* Sign-up box adjusted for mobile */}
          {!user && (
            <div
              className="relative rounded-lg border border-gray-700 inset-x-0 bottom-0 pb-4 px-4 bg-black bg-opacity-60 rounded-t-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {emailSent ? (
                <div>
                  <h2 className="text-3xl font-bold my-4 text-center text-white">
                    Check Your Email
                  </h2>
                  <p className="text-whitebg text-center">
                    We&apos;ve sent a login link to your email. Please check
                    your inbox and follow the instructions to complete the login
                    process.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold my-2 text-center text-white">
                    Claim Your Guide Now
                  </h2>
                  <form onSubmit={handleSendLink} className="space-y-2">
                    <input
                      ref={emailInputRef}
                      type="email"
                      id="email"
                      className="w-full border-2 text-whitebg border-gray-700 p-3 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-800 text-white p-3 rounded-lg flex justify-center items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Start Training"
                      )}
                    </button>
                    <p className="text-sm text-center text-white">
                      If you already have an account, we&apos;ll log you in.
                    </p>
                  </form>
                </>
              )}
              {message && (
                <p
                  className={`mt-4 text-center ${
                    emailSent ? "text-whitebg" : "text-red-500"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          )}
        </div>
        {/* Adjust buttons for mobile */}
        <div className="z-100 relative justify-center items-center flex space-x-2 my-4">
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent default action
              e.stopPropagation(); // Stop event bubbling
              toggleSound();
            }}
            className="bg-gray-700 p-2 rounded-full focus:outline-none"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent default action
              e.stopPropagation(); // Stop event bubbling
              togglePlay();
            }}
            className="bg-gray-700 p-2 rounded-full focus:outline-none"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

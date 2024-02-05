import React, { useState, useEffect, ReactElement, useRef } from "react";
import { NextPageWithLayout, auth } from "./_app";
import { useStore } from "@/RootStoreProvider";
import { isSignInWithEmailLink } from "firebase/auth";
import { useRouter } from "next/router";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import Image from "next/image";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { observer } from "mobx-react";
import { CircularProgress } from "@mui/material";

const HomePage: NextPageWithLayout = () => {
  const { authStore } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true); // State to manage video play/pause
  const videoRef = useRef<HTMLVideoElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const toggleSound = () => {
    if (videoRef.current) {
      const currentVideo = videoRef.current;
      setIsMuted(!isMuted);
      currentVideo.muted = !isMuted;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      // Update the isPlaying state based on the video's paused state
      setIsPlaying(!videoRef.current.paused);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }, 9361.5); // 10000 milliseconds = 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleSendLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    e.stopPropagation();
    try {
      await authStore.sendSignInLink(email, router.pathname, true);
      setEmailSent(true);
      setMessage("Check your email for the sign-in link.");
    } catch (error: any) {
      setMessage("Error sending email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUrl = window.location.href;
    if (isSignInWithEmailLink(auth, currentUrl)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }
      if (email) {
        window.localStorage.setItem("emailForSignIn", email);

        authStore
          .confirmSignInWithEmailLink(email, currentUrl)
          .then((isSignedIn) => {
            if (isSignedIn) {
              if (
                authStore.user?.guideItems?.length &&
                authStore.user.guideItems.length > 0
              ) {
                router.push("/profile");
              } else {
                router.push("/zone2guide");
              }
            }
          })
          .catch((error) => {
            setMessage("Error signing in: " + error.message);
          });
      }
    }
  }, [router]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation(); // This stops the click event from bubbling up to the parent div
    togglePlay();
  };

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.code === "Space") {
          e.preventDefault();
          togglePlay();
        }
      }}
    >
      {/* Video container with fading effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://firebasestorage.googleapis.com/v0/b/zone2program-a24ce.appspot.com/o/zone4.mp4?alt=media&token=50bcc0b5-9d9b-4863-93c9-9901ae9ecffd"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black opacity-50" />
      </div>

      <div
        className="relative z-10 px-4 pt-16 mx-auto w-[1150px] max-w-full"
        style={{
          textShadow: "10px 10px 10px rgba(0,0,0,1)",
        }}
      >
        {/* Expert Testimonials */}
        <div className="text-whitebg mb-6 py-4 rounded-lg">
          <h2 className="text-3xl font-bold">Tailored To Your Fitness Level</h2>
          <p className="mt-2">
            To offer you a comprehensive guide to Zone 2 training, we have
            compiled the recommendations of Dr. Peter Attia and Dr. Iñigo San
            Millán.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex justify-between items-start">
          {/* Left side content */}
          <div className="bg-black bg-opacity-60 p-6 rounded-lg border border-gray-700 max-w-[500px]">
            <h1 className="text-5xl font-bold text-whitebg mb-6">
              Your Tailored Guide to Zone 2
            </h1>
            <p className="text-lg text-whitebg mb-4">
              Uncovers the scientific details behind Zone 2 training and applies
              them to your fitness level.
            </p>
            {/* Includes */}
            <h2 className="text-2xl font-bold text-whitebg mb-2">Includes:</h2>
            <ul className="list-disc list-inside mb-6 text-whitebg">
              <li>Your Expected Benefits</li>
              <li>Effective Exercise Duration, Frequency & Dose</li>
              <li>Methods For Determining Zone 2 Intensity</li>
              <li>Your Heart Rate Zones</li>
              <li>What To Think About During Zone 2 Training</li>
              <li>Realistic Goals & Expectations</li>
              <li>Recovery & Preventing Overtraining</li>
            </ul>

            {/* Bottom content with laurel */}
            <div className="relative text-center mt-6 py-3 h-[100px] flex flex-col justify-center items-center">
              <p className="text-sm font-bold text-whitebg px-20">
                Based upon the recommendations of Dr. PETER ATTIA & Dr. IÑIGO
                SAN MILLÁN
              </p>
              <Image
                src="/assets/laurel.svg"
                alt="Laurel"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                width={405}
                height={50}
              />
            </div>
          </div>
          {/* Right side sign-up box */}
          {!authStore.user && (
            <div className="bg-black bg-opacity-60 p-8 rounded-lg border border-gray-700 text-whitebg w-[367px]">
              {emailSent ? (
                <div>
                  <h2 className="text-3xl font-bold mb-6">Check Your Email</h2>
                  <p className="mt-4 text-green-500">
                    We&apos;ve sent a sign-up link to your email. Please check
                    your inbox and follow the instructions to complete the
                    sign-up process.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-6">
                    Get Your Guide Now
                  </h2>
                  <form
                    onSubmit={handleSendLink}
                    className="flex flex-col gap-6"
                  >
                    <input
                      ref={emailInputRef}
                      type="email"
                      id="email"
                      className="border-2 text-whitebg border-gray-700 p-3 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus={true}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="submit"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-blue-600 hover:bg-blue-800 text-whitebg p-3 rounded-lg transition duration-300 flex justify-center items-center"
                      disabled={loading} // Disable button while loading
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Start Training"
                      )}
                    </button>
                    <p className="text-sm">
                      If you already have an account, we&apos;ll log you in
                    </p>
                  </form>
                  {message && (
                    <p
                      className={`mt-4 ${
                        emailSent ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sound toggle button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleSound();
        }}
        className="absolute right-4 bottom-4 bg-gray-700 hover:bg-gray-900 p-2 rounded-full focus:outline-none z-20 flex items-center justify-center shadow-lg"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        style={{ width: "50px", height: "50px" }}
      >
        {isMuted ? (
          <VolumeOffIcon
            fontSize="large"
            sx={{
              color: "white",
            }}
          />
        ) : (
          <VolumeUpIcon
            fontSize="large"
            sx={{
              color: "white",
            }}
          />
        )}
      </button>
      {/* Play/Pause toggle button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className="absolute bottom-4 bg-gray-700 hover:bg-gray-900 p-2 rounded-full focus:outline-none z-20 flex items-center justify-center shadow-lg"
        aria-label={isPlaying ? "Pause video" : "Play video"}
        style={{
          width: "50px",
          height: "50px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {isPlaying ? (
          <PauseIcon
            fontSize="large"
            sx={{
              color: "white",
            }}
          />
        ) : (
          <PlayArrowIcon
            fontSize="large"
            sx={{
              color: "white",
            }}
          />
        )}
      </button>
    </div>
  );
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(HomePage);

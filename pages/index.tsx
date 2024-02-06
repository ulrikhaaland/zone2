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
import { HomeDesktopLayout } from "@/app/homepage/DesktopLayout";
import { HomeMobileLayout } from "@/app/homepage/MobileLayout";

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
  const [isMobileView, setIsMobileView] = useState(false); // Set a default state

  useEffect(() => {
    // Ensure window is defined (it will be, as this runs in the client)
    const handleResize = () => setIsMobileView(window.innerWidth < 768);

    // Set initial state based on current window size
    handleResize();

    // Setup event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      const currentVideo = videoRef.current;
      setIsMuted(!isMuted);
      currentVideo.muted = !isMuted;
    }
  };

  useEffect(() => {
    console.log("authStore.open: ", authStore.open);
    if (authStore.open) {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [authStore.open]);

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
    if (!window) return;
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

  if (isMobileView) {
    return (
      <HomeMobileLayout
        isMuted={isMuted}
        isPlaying={isPlaying}
        email={email}
        setEmail={setEmail}
        emailSent={emailSent}
        loading={loading}
        message={message}
        videoRef={videoRef}
        emailInputRef={emailInputRef}
        toggleSound={toggleSound}
        togglePlay={togglePlay}
        handleClick={handleClick}
        handleSendLink={handleSendLink}
        user={authStore.user ?? undefined}
      />
    );
  } else
    return (
      <HomeDesktopLayout
        isMuted={isMuted}
        isPlaying={isPlaying}
        email={email}
        setEmail={setEmail}
        emailSent={emailSent}
        loading={loading}
        message={message}
        videoRef={videoRef}
        emailInputRef={emailInputRef}
        toggleSound={toggleSound}
        togglePlay={togglePlay}
        handleClick={handleClick}
        handleSendLink={handleSendLink}
        user={authStore.user ?? undefined}
      />
    );
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(HomePage);

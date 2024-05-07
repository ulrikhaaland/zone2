import React, { useState, useEffect, ReactElement, useRef } from "react";
import { useStore } from "@/RootStoreProvider";
import { isSignInWithEmailLink } from "firebase/auth";
import { useRouter } from "next/router";
import { observer } from "mobx-react";
import { HomeDesktopLayout } from "@/app/landing-page/DesktopLayout";
import { HomeMobileLayout } from "@/app/landing-page/MobileLayout";
import { auth } from "@/pages/_app";
import Guide from "../components/guide";

const LandingPage = () => {
  const { authStore, generalStore } = useStore();
  const { user } = authStore;
  const { isMobileView } = generalStore;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true); // State to manage video play/pause
  const videoRef = useRef<HTMLVideoElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [isSignupLink, setIsSignupLink] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  const toggleSound = () => {
    if (videoRef.current) {
      const currentVideo = videoRef.current;
      setIsMuted(!isMuted);
      currentVideo.muted = !isMuted;
    }
  };

  useEffect(() => {
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
        setIsMuted(false);
        videoRef.current.play();
        setIsPlaying(true);
        setVideoStarted(true); // Set video started to true when video plays
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVideoPlay = () => {
    setVideoStarted(true); // Set video started to true when video plays
    setIsPlaying(true);
  };

  useEffect(() => {
    setCanPlayVideo(true);
  }, [authStore.hasCheckedAuth]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (videoStarted) {
      // Check if video has started
      timer = setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }, 9161.5); // Adjust the time as needed
    }

    return () => clearTimeout(timer); // Cleanup to clear the timer
  }, [videoStarted]); // Depend on the videoStarted state

  const handleSendLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    e.stopPropagation();
    try {
      await authStore.sendSignInLink(email, router.pathname);
      setEmailSent(true);
    } catch (error: any) {
      setMessage("Error sending email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSignInLink();
  }, []);

  const checkSignInLink = async () => {
    const currentUrl = window.location.href;
    if (
      isSignInWithEmailLink(auth, currentUrl) &&
      !authStore.user &&
      !isSignupLink
    ) {
      setIsSignupLink(true);
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }
      if (email) {
        window.localStorage.setItem("emailForSignIn", email);
        setMessage("");

        authStore
          .confirmSignInWithEmailLink(email, currentUrl)
          .then((isSignedIn) => {
            if (isSignedIn) {
              setMessage("Signed in successfully");
              if (
                authStore.user?.guideItems?.length &&
                authStore.user.guideItems.length > 0
              ) {
                router.push("/profile");
              } else {
                router.push("/create");
              }
            }
          })
          .catch((error) => {
            setMessage("Error signing in: " + error.message);
          });
      }
    }
  };
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation(); // This stops the click event from bubbling up to the parent div
    togglePlay();
  };

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [authStore.open]);

  if (user?.hasPaid) {
    return <Guide />;
  }

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
        isSignupLink={isSignupLink}
        handleVideoPlay={handleVideoPlay}
        canPlayVideo={canPlayVideo}
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
        handleVideoPlay={handleVideoPlay}
      />
    );
};

export default observer(LandingPage);

import AuthStore from "@/app/stores/auth.store";
import { observer } from "mobx-react";
import { NextRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

interface WebMenuProps {
  router: NextRouter;
  authStore: AuthStore;
}

const WebMenu: React.FC<WebMenuProps> = ({ router, authStore }) => {
  const { user } = authStore;

  const pathName = router.pathname;

  const titleRef = useRef<HTMLHeadingElement>(null);
  const guideRef = useRef<HTMLParagraphElement>(null);
  const zonesRef = useRef<HTMLParagraphElement>(null);
  const blogRef = useRef<HTMLParagraphElement>(null);
  const profileRef = useRef<HTMLParagraphElement>(null);

  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const navContainerRef = useRef<HTMLDivElement>(null);

  const updateUnderline = (ref: React.RefObject<HTMLElement>) => {
    if (navContainerRef.current && ref.current) {
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const refRect = ref.current.getBoundingClientRect();
      setUnderlineStyle({
        left: refRect.left - containerRect.left,
        width: refRect.width,
      });
    }
  };

  useEffect(() => {
    if (pathName === "/") {
      updateUnderline(titleRef);
    } else if (pathName === "/guide") {
      updateUnderline(guideRef);
    } else if (pathName === "/heartratecalculator") {
      updateUnderline(zonesRef);
    } else if (pathName.includes("/articles")) {
      updateUnderline(blogRef);
    } else if (pathName === "/profile") {
      updateUnderline(profileRef);
    } else {
      setUnderlineStyle({ left: 0, width: 0 });
    }
  }, [pathName, user]);

  return (
    <div className="hidden lg:flex w-full justify-center items-center text-whitebg">
      <div
        ref={navContainerRef}
        className="max-w-[1500px] w-full flex justify-between items-center relative border-b pb-6 border-b-1 border-gray-500"
        style={{ textShadow: "10px 10px 10px rgba(0,0,0,1)" }}
      >
        {/* Left side - Title with Spacer */}
        <div className="flex-1 flex justify-start">
          <h1
            ref={titleRef}
            onClick={() => router.push("/")}
            className={`text-3xl font-semibold leading-6 ${
              pathName === "/"
                ? "text-white hover:text-gray-300"
                : "text-gray-400 hover:text-gray-300"
            }`}
            style={{ cursor: "pointer" }}
          >
            Zone 2 Guide
          </h1>
        </div>

        {/* Center - Navigation links */}
        <div className="flex justify-center relative">
          <p
            ref={guideRef}
            onClick={() => router.push("/guide")}
            className={`leading-6 mx-4 ${
              pathName === "/guide"
                ? "text-white hover:text-gray-300 text-3xl font-bold"
                : "text-gray-400 hover:text-gray-300 text-2xl font-semibold"
            }`}
            style={{ cursor: "pointer" }}
          >
            Create Guide
          </p>
          <p
            ref={zonesRef}
            onClick={() => router.push("/heartratecalculator")}
            className={`leading-6 mx-4 ${
              pathName === "/heartratecalculator"
                ? "text-white hover:text-gray-300 text-3xl font-bold"
                : "text-gray-400 hover:text-gray-300 text-2xl font-semibold"
            }`}
            style={{ cursor: "pointer" }}
          >
            Training Zones
          </p>
          <p
            ref={blogRef}
            onClick={() => router.push("/articles")}
            className={`leading-6 mx-4 ${
              pathName.includes("/articles")
                ? "text-white hover:text-gray-300 text-3xl font-bold"
                : "text-gray-400 hover:text-gray-300 text-2xl font-semibold"
            }`}
            style={{ cursor: "pointer" }}
          >
            Articles
          </p>
        </div>

        {/* Right side - Profile/Login with Spacer */}
        <div className="flex-1 flex justify-end">
          {user?.hasPaid || !user ? (
            <p
              ref={profileRef}
              onClick={() => {
                if (!user) {
                  if (authStore.open === true) {
                    authStore.setOpen(false);
                    setTimeout(() => authStore.setOpen(true), 300);
                  }
                  // timeout to allow the modal to close before redirecting
                  else authStore.setOpen(true);
                } else {
                  router.push("/profile");
                }
              }}
              className={`text-3xl font-semibold leading-6 ${
                pathName === "/profile"
                  ? "text-white hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              style={{ cursor: "pointer" }}
            >
              {!user ? "Log in" : "Profile"}
            </p>
          ) : (
            <p className="text-3xl font-semibold leading-6 text-transparent">
              Profile
            </p>
          )}
        </div>

        {/* Animated Underline */}
        <div
          className="absolute bg-white h-[3px] transition-all ease-out duration-300"
          style={{
            ...underlineStyle,
            bottom: "-2px", // Adjust the space here as needed
          }}
        />
      </div>
    </div>
  );
};

export default observer(WebMenu);

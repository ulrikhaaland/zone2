import { useEffect, useState } from "react";
import { Dialog, Popover } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";
import WebMenu from "./WebMenu";
import MobileMenu from "./MobileMenu";
import Image from "next/image";
import { profile } from "console";

const Header = ({}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { authStore, generalStore } = useStore();
  const [hideHeader, setHideHeader] = useState(false);
  const [currentPath, setCurrentPath] = useState(router.pathname);
  const [currentTitle, setCurrentTitle] = useState("Zone 2 Guide");

  const { isMobileView, scrollableContentRef } = generalStore;

  const isHome = router.pathname === "/";

  useEffect(() => {
    setHideHeader(false);
    if (router.pathname === "/create") {
      setCurrentTitle("Create Guide");
      setCurrentPath("/create");
    } else if (router.pathname === "/profile") {
      setCurrentTitle("Profile");
      setCurrentPath("/profile");
    } else if (router.pathname === "/heartratecalculator") {
      setCurrentTitle("Training Zones");
      setCurrentPath("/heartratecalculator");
    } else if (router.pathname.includes("/articles")) {
      setCurrentTitle("Articles");
      setCurrentPath("/articles");
    } else {
      setCurrentTitle("Zone 2 Guide");
      setCurrentPath("/");
    }
  }, [router.pathname]);

  const headerHideThreshold = isMobileView ? 52 : 20;

  useEffect(() => {
    if (!scrollableContentRef?.current) return;

    const handleScroll = () => {
      if (!scrollableContentRef.current) return;
      // Log the current scroll position and the window's height

      if (scrollableContentRef.current.scrollTop > headerHideThreshold) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
    };

    const contentElement = scrollableContentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [scrollableContentRef]);

  // Add or remove a class based on the hideHeader state
  const headerClasses = `bg-transparent fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
    hideHeader ? "-translate-y-full" : ""
  }`;

  return (
    <header className={headerClasses}>
      <nav
        className="flex justify-between items-center lg:py-6 py-2 px-4 lg:px-12 z-150"
        aria-label="Global"
      >
        {/* Logo and Title, now part of the flex layout without fixed positioning */}
        {isMobileView && (
          <div
            style={{ cursor: "pointer" }}
            className="flex items-center" // Ensure alignment
            onClick={() => router.push(currentPath)}
          >
            <h1
              className={`text-3xl font-semibold leading-6 ${
                isHome || isMobileView
                  ? "text-whitebg hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              {currentTitle}
            </h1>
          </div>
        )}

        {/* Mobile Burger Menu */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md py-2 px-0 text-whitebg icon-shadow" // Add the icon-shadow class here
            onClick={() => {
              authStore.setOpen(true);
              setMobileMenuOpen(true);
            }}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-8 w-8" aria-hidden="true" />
          </button>
        </div>

        <WebMenu router={router} authStore={authStore} />
      </nav>
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => {
          authStore.setOpen(false);
          setMobileMenuOpen(false);
        }}
        router={router}
        authStore={authStore}
      />
    </header>
  );
};

export default observer(Header);

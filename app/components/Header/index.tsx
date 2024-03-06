import { useState } from "react";
import { Dialog, Popover } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";
import WebMenu from "./WebMenu";
import MobileMenu from "./MobileMenu";
import Image from "next/image";
import { profile } from "console";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { authStore, generalStore } = useStore();

  const { isMobileView } = generalStore;

  const isHome = router.pathname === "/";
  const isGuide = router.pathname === "/guide";
  const isProfile = router.pathname === "/profile";
  const isZones = router.pathname === "/heartratecalculator";

  const getTitle = () => {
    if (isMobileView) {
      if (isGuide) {
        return "Create Guide";
      } else if (isProfile) {
        return "Profile";
      } else if (isZones) {
        return "Training Zones";
      }
    }

    return "Zone 2 Guide";
  };
  // border-b border-gray-700
  return (
    <header
      className={`bg-transparent fixed top-0 left-0 w-full z-50 
      ${!isHome && !isMobileView && ""}
         `}
    >
      <nav
        className="flex justify-between items-center lg:py-6 py-2 px-4 lg:px-12 z-150"
        aria-label="Global"
      >
        {/* Logo and Title, now part of the flex layout without fixed positioning */}
        {isMobileView && (
          <div
            style={{ cursor: "pointer" }}
            className="flex items-center" // Ensure alignment
            onClick={() => router.push("/")}
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
              {getTitle()}
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
}

export default observer(Header);

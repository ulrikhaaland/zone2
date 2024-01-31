import { useState } from "react";
import { Dialog, Popover } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";
import WebMenu from "./WebMenu";
import MobileMenu from "./MobileMenu";
import Image from "next/image";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { authStore } = useStore();

  const isHome = router.pathname === "/";

  return (
    <header className="bg-transparent fixed top-0 left-0 w-full z-50">
      <nav
        className="flex justify-between items-center py-6 lg:px-12"
        aria-label="Global"
      >
        <div className="flex">
          {/* Logo and Title Container */}
          <div
            style={{ cursor: "pointer" }}
            className="flex fixed left-6 lg:left-12 top-6" // Adjusted for flex container
            onClick={() => router.push("/")}
          >
            <h1
              className={`text-3xl font-semibold leading-6 ${
                isHome ? "text-white" : "text-white"
              } group-hover:text-title2`}
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              Zone 2 Guide
            </h1>
          </div>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <WebMenu router={router} authStore={authStore} />
      </nav>
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        router={router}
        authStore={authStore}
      />
    </header>
  );
}

export default observer(Header);

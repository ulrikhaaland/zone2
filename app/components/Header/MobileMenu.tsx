import React, { useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  router: any;
  authStore: any;
}

function MobileMenu({ isOpen, onClose, router, authStore }: MobileMenuProps) {
  const { user } = authStore;

  const pathName = router.pathname;

  const isHome = pathName === "/";

  const isGuide = pathName === "/guide";

  const isProfile = pathName === "/profile";

  const isZones = pathName === "/heartratecalculator";

  useEffect(() => {}, [authStore.user, router.pathname, pathName]);

  return (
    <Dialog as="div" className="lg:hidden" open={isOpen} onClose={onClose}>
      {/* Background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100, // Ensure this is below the modal content
        }}
      >
        {/* Background Image */}
        <div
          style={{
            backgroundImage: "url('/assets/images/cyclist/cyclist.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100, // Ensure this is below the overlay
          }}
        ></div>

        {/* Black Overlay with Opacity */}
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        ></div>
      </div>

      <Dialog.Panel
        style={{ zIndex: 101 }} // Even higher z-index for the dialog panel
        className="fixed inset-y-0 right-0 w-full overflow-y-auto px-4 py-4"
      >
        <div className="flex items-center justify-between">
          <h1
            onClick={() => {
              onClose();
              router.push("/");
            }}
            className={`font-semibold leading-6 ${
              isHome
                ? "text-white hover:text-gray-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
            style={{
              textShadow: "10px 10px 10px rgba(0,0,0,1)",
              fontSize: "1.928rem",
              letterSpacing: "0.0325rem",
            }}
          >
            Zone 2 Guide
          </h1>
          <button
            type="button"
            className="rounded-md text-white"
            onClick={onClose}
          >
            <span className="sr-only">Close menu</span>
            <XMarkIcon className="h-8 w-8 icon-shadow" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-gray-500/10">
            <div
              className="space-y-2 py-6"
              style={{
                textShadow: "10px 10px 10px rgba(0,0,0,1)",
              }}
            >
              <div className="border-b border-gray-500">
                <p
                  onClick={() => {
                    onClose();

                    router.push("/guide");
                  }}
                  style={{ cursor: "pointer" }}
                  className={`-mx-3 text-lg block rounded-lg px-3 py-2 text-base leading-7 font-semibold
                ${
                  isGuide
                    ? "text-whitebg hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-300"
                }
                `}
                >
                  Create Zone 2 Guide
                </p>
              </div>
              <div className="border-b border-gray-500">
                <p
                  onClick={() => {
                    onClose();
                    router.push("/heartratecalculator");
                  }}
                  style={{ cursor: "pointer" }}
                  className={`-mx-3 block text-lg rounded-lg px-3 py-2 text-base leading-7 font-semibold
                    ${
                      isZones
                        ? "text-whitebg hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-300"
                    }
                    `}
                >
                  Training Zones
                </p>
              </div>
              {!user ||
                (user?.hasPaid && (
                  <div className="border-b border-gray-500">
                    <p
                      onClick={() => {
                        onClose();
                        router.push("/profile");
                      }}
                      style={{ cursor: "pointer" }}
                      className={`-mx-3 block text-lg rounded-lg px-3 py-2 text-base leading-7 font-semibold
                    ${
                      isProfile
                        ? "text-whitebg hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-300"
                    }
                    `}
                    >
                      Profile
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

export default MobileMenu;

import React from "react";
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

  return (
    <Dialog as="div" className="lg:hidden" open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-10 bg-gray-600 bg-opacity-25" />
      <Dialog.Panel
        style={{ zIndex: 40 }}
        className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-secondary-bg px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
      >
        <div className="flex items-center justify-between">
          <h2 className="-m-1.5 p-1.5 text-lg font-semibold leading-7 text-title">
            Zone 2 Program
          </h2>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close menu</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-gray-500/10">
            <div className="space-y-2 py-6">
              <p
                onClick={() => {
                  router.push("/create-program");
                  onClose();
                }}
                style={{ cursor: "pointer" }}
                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
              >
                Create Program
              </p>
              <p
                onClick={() => {
                  router.push("/zone2-calculator");
                  onClose();
                }}
                style={{ cursor: "pointer" }}
                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
              >
                Zone 2 Heart Rate Calculator
              </p>
              <p
                onClick={() => {
                  router.push("/zone2-content");
                  onClose();
                }}
                style={{ cursor: "pointer" }}
                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
              >
                Zone 2 Content
              </p>
            </div>
            <div className="py-6">
              <p
                onClick={() => {
                  authStore.setOpen(true);
                  onClose();
                }}
                style={{ cursor: "pointer" }}
                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
              >
                {user ? "Personal Info" : "Log in"}
              </p>
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

export default MobileMenu;

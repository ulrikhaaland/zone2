import AuthStore from "@/app/stores/auth.store";
import { observer } from "mobx-react";
import { NextRouter } from "next/router";
import React, { useEffect } from "react";

interface WebMenuProps {
  router: NextRouter;
  authStore: AuthStore;
}

function WebMenu({ router, authStore }: WebMenuProps) {
  const { user } = authStore;

  const isHome = router.pathname === "/";

  useEffect(() => {}, [authStore.user]);

  return (
    <div
      className={`hidden lg:flex lg:gap-x-12 ${
        isHome ? "text-white" : "text-white"
      } `}
      style={{
        textShadow: "10px 10px 10px rgba(0,0,0,1)",
      }}
    >
      <p
        onClick={() => router.push("/zone2guide")}
        style={{
          cursor: "pointer",
        }}
        className={`text-lg font-semibold leading-6 group-hover:text-secondary-button`}
      >
        Create Zone 2 Guide
      </p>
      {/* <p
        onClick={() => router.push("/zone2-calculator")}
        style={{ cursor: "pointer" }}
        className="text-lg font-semibold leading-6 text-white group-hover:text-secondary-button"
      >
        Zone 2 Heart Rate Calculator
      </p>
      <p
        onClick={() => router.push("/zone2-content")}
        style={{ cursor: "pointer" }}
        className="text-lg font-semibold leading-6 text-white group-hover:text-secondary-button"
      >
        Zone 2 Content
      </p> */}

      {!user ||
        (user?.hasPaid && (
          <p
            className="text-lg font-semibold leading-6 group-hover:text-secondary-button"
            onClick={() => {
              if (!user) {
                authStore.setOpen(true);
                return;
              } else router.push("/profile");
            }}
            style={{ cursor: "pointer" }}
          >
            {!user ? "Log in" : "Profile"}
          </p>
        ))}
    </div>
  );
}

export default observer(WebMenu);

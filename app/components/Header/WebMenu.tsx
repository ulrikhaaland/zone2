import AuthStore from "@/app/stores/auth.store";
import { observer } from "mobx-react";
import { NextRouter } from "next/router";
import path from "path";
import React, { useEffect } from "react";

interface WebMenuProps {
  router: NextRouter;
  authStore: AuthStore;
}

function WebMenu({ router, authStore }: WebMenuProps) {
  const { user } = authStore;

  const pathName = router.pathname;

  const isHome = pathName === "/";

  const isGuide = pathName === "/guide";

  const isProfile = pathName === "/profile";

  const isHeartRateZones = pathName === "/heartratecalculator";

  useEffect(() => {}, [authStore.user, router.pathname, pathName]);

  return (
    <div
      className={`hidden lg:flex lg:gap-x-12 text-whitebg`}
      style={{
        textShadow: "10px 10px 10px rgba(0,0,0,1)",
      }}
    >
      <p
        onClick={() => {
          router.push("/guide");
        }}
        style={{
          cursor: "pointer",
        }}
        className={`text-lg font-semibold leading-6 
        ${isHome && "text-whitebg hover:text-gray-300"}  
        ${
          isGuide
            ? "text-whitebg hover:text-gray-300"
            : !isHome && "text-gray-500 hover:text-gray-300"
        }
        `}
      >
        Create Guide
      </p>
      <p
        onClick={() => router.push("/heartratecalculator")}
        style={{ cursor: "pointer" }}
        className={`text-lg font-semibold leading-6 
        ${isHome && "text-whitebg hover:text-gray-300"}  
        ${
          isHeartRateZones
            ? "text-whitebg hover:text-gray-300"
            : !isHome && "text-gray-500 hover:text-gray-300"
        }
        `}
      >
        Training Zones
      </p>
      {/* <p
        onClick={() => router.push("/zone2-content")}
        style={{ cursor: "pointer" }}
        className="text-lg font-semibold leading-6 text-whitebg group-hover:text-secondary-button"
      >
        Zone 2 Content
      </p>  */}

      {user?.hasPaid && (
        <p
          className={`text-lg font-semibold leading-6 group-hover:text-secondary-button
            ${isHome && "text-whitebg hover:text-gray-300"}  
            ${
              isProfile
                ? "text-whitebg hover:text-gray-300"
                : !isHome && "text-gray-500 hover:text-gray-300"
            }
            `}
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
      )}
    </div>
  );
}

export default observer(WebMenu);

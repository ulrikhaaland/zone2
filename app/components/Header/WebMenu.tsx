import React from "react";

interface WebMenuProps {
  router: any;
  authStore: any;
}

function WebMenu({ router, authStore }: WebMenuProps) {
  const { user } = authStore;

  const isHome = router.pathname === "/";

  return (
    <div
      className={`hidden lg:flex lg:gap-x-12 ${
        isHome ? "text-white" : "text-title2"
      } `}
      style={{
        textShadow: isHome ? "10px 10px 10px rgba(0,0,0,1)" : "",
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
      <p
        className="text-lg font-semibold leading-6 group-hover:text-secondary-button"
        onClick={() => authStore.setOpen(true)}
        style={{ cursor: "pointer" }}
      >
        {!user ? "Log in" : "Personal Info"}
      </p>
    </div>
  );
}

export default WebMenu;

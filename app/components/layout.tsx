import { Backdrop } from "@mui/material";
import Header from "./Header";
import Login from "./Login";
import { observer } from "mobx-react";
import { useStore } from "../../RootStoreProvider";
import { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { NextRouter, useRouter } from "next/router";

function Layout({ children }: { children: React.ReactNode }) {
  const { authStore } = useStore();
  const { open, setOpen, user } = authStore;
  const [showLogin, setShowLogin] = useState(false);
  // State to store the calculated content height
  const [contentHeightVh, setContentHeightVh] = useState(100);

  const router: NextRouter = useRouter(); // Update the type of router

  // Check if the current route is '/zone2guide'
  const isGuide = router.pathname === "/zone2guide";

  const isHome = router.pathname === "/";

  useEffect(() => {
    // Convert the header height from pixels to vh
    const headerHeightVh = (72 / window.innerHeight) * 100;
    setContentHeightVh(100 - headerHeightVh);
  }, []);

  useEffect(() => {
    if (!user) {
      if (open && !isHome) {
        setShowLogin(true);
      } else {
        setShowLogin(false);
      }
    }
  }, [open]);

  return (
    <>
      <Header></Header>
      <div
        className={`pt-18 font-custom ${
          isHome ? "bg-black" : "bg-third-bg"
        } text-black w-full overflow-auto`} // pt-18 provides padding top to account for the fixed header
        style={{
          height: `100vh`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
        {showLogin && <Login />}
      </div>
      <Backdrop
        sx={{zIndex: 100 }}
        open={open && showLogin}
        onClick={() => {
          if(isGuide) return;
          setOpen(false);
          authStore.setFromPath(undefined);
        }}
      />
    </>
  );
}

export default observer(Layout);

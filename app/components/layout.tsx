import { Backdrop } from "@mui/material";
import Header from "./Header";
import Login from "./Login";
import { observer } from "mobx-react";
import { useStore } from "../../RootStoreProvider";
import { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { NextRouter, useRouter } from "next/router";
import Head from "next/head";

function Layout({ children }: { children: React.ReactNode }) {
  const { authStore } = useStore();
  const { open, setOpen, user } = authStore;
  const router: NextRouter = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false); // Set a default state

  const isGuide = router.pathname === "/zone2guide";

  const isHome = router.pathname === "/";

  useEffect(() => {
    // Ensure window is defined (it will be, as this runs in the client)
    const handleResize = () => setIsMobileView(window.innerWidth < 768);

    // Set initial state based on current window size
    handleResize();

    // Setup event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      if (open && !isHome) {
        setShowLogin(true);
      } else {
        setShowLogin(false);
      }
    } else {
      setShowLogin(false);
    }
  }, [open, user, isHome]);

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/assets/images/cyclist/cyclist.png"
          as="image"
        />
        <link
          rel="preload"
          href="/assets/images/runner/runner8.png.png"
          as="image"
        />
      </Head>
      {!isMobileView || user ? <Header></Header> : null}
      <div
        className={`font-custom ${"bg-black"} text-black w-full overflow-auto`} // pt-18 provides padding top to account for the fixed header
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
        sx={{ zIndex: 100 }}
        open={open && showLogin}
        onClick={() => {
          if (isGuide && !user) return;
          setOpen(false);
          authStore.setFromPath(undefined);
        }}
      />
    </>
  );
}

export default observer(Layout);

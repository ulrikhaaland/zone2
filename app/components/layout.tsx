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
  const { authStore, generalStore } = useStore();
  const { open, setOpen, user } = authStore;
  const router: NextRouter = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const isMobileView = generalStore.isMobileView;
  const isGuide = router.pathname === "/zone2guide";

  const isHome = router.pathname === "/";

  const getShowHeader = (): boolean => {
    if (isMobileView) {
      if (!user) return false;

      return true;
      if (isGuide) {
        return true;
      }
      if (user) {
        return true;
      }
    }

    return true;
  };

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
      {getShowHeader() && <Header></Header>}
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

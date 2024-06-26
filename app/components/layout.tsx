import { Backdrop } from "@mui/material";
import Header from "./Header";
import Login from "./Login";
import { observer } from "mobx-react";
import { useStore } from "../../RootStoreProvider";
import { useState, useEffect } from "react";
import { NextRouter, useRouter } from "next/router";
import Head from "next/head";
import Loading from "./loading";

function Layout({ children }: { children: React.ReactNode }) {
  const { authStore, generalStore, guideStore } = useStore();
  const { open, setOpen, user, hasCheckedAuth } = authStore;
  const router: NextRouter = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobileView = generalStore.isMobileView;
  const currentRoute = router.pathname;

  const isHome = router.pathname === "/";

  const isArticles = router.pathname.includes("/articles");

  const getShowHeader = (): boolean => {
    if (isMobileView) {
      if (!user) {
        if (isHome) return false;
      }

      return true;
    }

    return true;
  };

  useEffect(() => {
    if (!user) {
      if ((open && !isHome) || (!isArticles && !isHome)) {
        setShowLogin(true);
      } else {
        setShowLogin(false);
      }
    } else {
      setShowLogin(false);
    }
  }, [open, user, isHome, currentRoute]);

  useEffect(() => {
    if (hasCheckedAuth) {
      if (user) {
        if (
          guideStore.guideItems.length < 1 ||
          (guideStore.guideItems.length > 0 &&
            user.guideItems.length > 0 &&
            guideStore.guideItems[guideStore.guideItems.length - 1].id !==
              user.guideItems[user.guideItems.length - 1].id)
        ) {
          guideStore.setGuideItems(user.guideItems);
        }
      }
      if (!isLoaded) setIsLoaded(true);
    }

    if (hasCheckedAuth && !user && !isHome && !isArticles) {
      setOpen(true);
    }
  }, [hasCheckedAuth, user, isHome, currentRoute]);

  return (
    <>
      <Head>
        {isMobileView ? (
          <>
            <link
              rel="preload"
              href="/assets/images/cyclist/cyclist.png"
              as="image"
            />
            <link
              rel="preload"
              href="/assets/images/runner/runner12.png"
              as="image"
            />
          </>
        ) : (
          <>
            <link
              rel="preload"
              href="/assets/images/cyclist/cyclist.png"
              as="image"
            />
            <link
              rel="preload"
              href="/assets/images/runner/runner8.png"
              as="image"
            />
            <link
              rel="preload"
              href="/assets/images/swimmer/swimmer.png"
              as="image"
            />
          </>
        )}
      </Head>
      {getShowHeader() && <Header></Header>}
      <div
        className={`font-custom ${"bg-black"} text-black w-full`}
        style={{
          height: `100dvh`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {isLoaded ? children : <Loading />}
        {showLogin && isLoaded && <Login />}
      </div>
      <Backdrop
        sx={{ zIndex: 100 }}
        open={open && showLogin}
        onClick={() => {
          if (!user && !isArticles) return;
          setOpen(false);
          authStore.setFromPath(undefined);
        }}
      />
    </>
  );
}

export default observer(Layout);

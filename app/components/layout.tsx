import { Backdrop } from "@mui/material";
import Header from "./Header";
import Login from "./Login";
import { observer } from "mobx-react";
import LoggedIn from "./Login/LoggedIn";
import { useStore } from "../../RootStoreProvider";
import { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { NextRouter, useRouter } from "next/router";

function Layout({ children }: { children: React.ReactNode }) {
  const { authStore } = useStore();
  const { open, setOpen, user } = authStore;

  // State to store the calculated content height
  const [contentHeightVh, setContentHeightVh] = useState(100);

  const router: NextRouter = useRouter(); // Update the type of router

  // Check if the current route is '/zone2guide'
  const isHome = router.pathname === "/";

  useEffect(() => {
    // Convert the header height from pixels to vh
    const headerHeightVh = (72 / window.innerHeight) * 100;
    setContentHeightVh(100 - headerHeightVh);
  }, []);

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
        {open ? user ? <LoggedIn /> : <Login /> : null}
      </div>
      <Backdrop
        sx={{ color: "#fff", zIndex: 100 }}
        open={open}
        onClick={() => {
          setOpen(false);
          authStore.setFromPath(undefined);
        }}
      />
    </>
  );
}

export default observer(Layout);

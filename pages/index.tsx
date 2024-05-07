import React, { useState, useEffect, ReactElement, useRef } from "react";
import { NextPageWithLayout, auth } from "./_app";
import { useStore } from "@/RootStoreProvider";
import { isSignInWithEmailLink } from "firebase/auth";
import { useRouter } from "next/router";
import { observer } from "mobx-react";
import { HomeDesktopLayout } from "@/app/landing-page/DesktopLayout";
import { HomeMobileLayout } from "@/app/landing-page/MobileLayout";
import LandingPage from "@/app/landing-page";

const HomePage: NextPageWithLayout = () => {
  return <LandingPage />;
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(HomePage);

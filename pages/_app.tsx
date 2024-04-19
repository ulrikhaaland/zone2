"use client";
import "../app/globals.css";
import { Provider } from "mobx-react";
import type { AppProps } from "next/app";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import React, { ReactElement, ReactNode, useEffect } from "react";
import { NextPage } from "next";
import { RootStoreProvider, useStore } from "@/RootStoreProvider";
import { Inter } from "next/font/google";
import Layout from "../app/components/layout";

const inter = Inter({ subsets: ["latin"] });

const firebaseConfig = {
  apiKey: "AIzaSyCyS424Ct0bD6WXHuUcv2eI-lZjApJb5pU",
  authDomain: "zone2program-a24ce.firebaseapp.com",
  projectId: "zone2program-a24ce",
  storageBucket: "zone2program-a24ce.appspot.com",
  messagingSenderId: "505124953989",
  appId: "1:505124953989:web:e7a050fa6f94ba3beb6eec",
  measurementId: "G-LMBP764LCL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { authStore, generalStore } = useStore();
  const [isMobileView, setIsMobileView] = React.useState(false);

  useEffect(() => {
    if (!authStore.user && auth) authStore.checkAuth();
  }, [authStore]);

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
    generalStore.setIsMobileView(isMobileView);
  }, [generalStore, isMobileView]);

  // Use the getLayout function if it's defined in the page component
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <main className={inter.className}>
      <React.StrictMode>
        <Provider>
          <React.Suspense fallback={<div>Loading...</div>}>
            <RootStoreProvider>
              <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
            </RootStoreProvider>
            
          </React.Suspense>
        </Provider>
      </React.StrictMode>
    </main>
  );
}

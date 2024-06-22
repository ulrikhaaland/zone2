import React, { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";
import { observer } from "mobx-react";
import LandingPage from "@/app/landing-page";

const HomePage: NextPageWithLayout = () => {
  return <LandingPage />;
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(HomePage);

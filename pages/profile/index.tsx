import { ReactElement, useEffect, useRef, useState } from "react";
import { NextPageWithLayout, auth, db } from "../_app";
import { useStore } from "@/RootStoreProvider";
import { GuideStatus, User } from "@/app/model/user";
import { Question, questToFitnessData } from "@/app/model/questionaire";
import { observer } from "mobx-react";
import ProfileDesktopLayout from "./DesktopLayout";
import ProfileMobileLayout from "./MobileLayout";
import { doc, updateDoc } from "firebase/firestore";

const UserProfile: NextPageWithLayout = () => {
  const { authStore, generalStore } = useStore();

  const { isMobileView } = generalStore;

  const [user, setUser] = useState<User | undefined>(
    authStore.user ?? undefined
  );

  const updateUser = (questions: Question[]) => {
    const updatedUser = {
      ...user!,
      questions: questions,
    };
    console.log(updatedUser);
    authStore.updateUserData(updatedUser);
  };

  if (isMobileView) {
    return <ProfileMobileLayout user={user} updateUser={updateUser} />;
  } else {
    return <ProfileDesktopLayout user={user} updateUser={updateUser} />;
  }
};

UserProfile.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default observer(UserProfile);

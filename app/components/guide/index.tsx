import { ReactElement, useEffect, useRef, useState } from "react";
import { useStore } from "@/RootStoreProvider";
import { GuideStatus, User } from "@/app/model/user";
import { Question, questToFitnessData } from "@/app/model/questionaire";
import { observer } from "mobx-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/pages/_app";
import GuideDesktopLayout from "./desktop";
import GuideMobileLayout from "./mobile";

const Guide = () => {
  const { authStore, generalStore, guideStore } = useStore();

  const { isMobileView } = generalStore;

  const { setGuideItems, addGuideItem } = guideStore;

  const [user, setUser] = useState<User | undefined>(
    authStore.user ?? undefined
  );

  const [pageIndex, setPageIndex] = useState(0);

  const [guideStatus, setGuideStatus] = useState(user?.guideStatus);
  const [showFeedback, setShowFeedback] = useState(false);

  const updateUser = (questions: Question[]) => {
    const updatedUser = {
      ...user!,
      questions: questions,
    };
    console.log(updatedUser);
    authStore.updateUserData(updatedUser);
  };

  useEffect(() => {
    if (user) {
      setGuideStatus(user.guideStatus);
    }
  }, [user]);

  const isFetching = useRef<boolean>(false);
  const isSubscribed = useRef<boolean>(false);

  const generateGuide = (user: User) => {
    // Set Loading status
    isFetching.current = true;
    setGuideStatus(GuideStatus.LOADING);

    const newUser = { ...user, guideStatus: GuideStatus.LOADING };
    guideStore.setGuideItems([]);
    authStore.setUser(newUser);
    setUser(newUser);
    updateDoc(doc(db, "users", user.uid), {
      guideStatus: GuideStatus.LOADING,
    }).then(() => {
      const body = JSON.stringify({
        fitnessData: questToFitnessData(user!.questions),
        uid: user!.uid,
      });
      console.log(body);
      fetch("/api/generate-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      })
        .then(async (value) => {
          isFetching.current = false;
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          isFetching.current = false;
        });
    });
  };

  useEffect(() => {
    if (!authStore.user) {
      authStore.checkAuth();
      return;
    } else if (
      !user ||
      (user?.guideStatus === GuideStatus.HASPAID && user?.hasPaid === true)
    ) {
      const user = authStore.user;

      if (
        (user.guideStatus === GuideStatus.HASPAID &&
          user.hasPaid &&
          !isFetching.current) ||
        (user.guideStatus === GuideStatus.LOADING && !isFetching.current)
      ) {
        generateGuide(user);
      } else {
        if (isFetching.current) {
          console.log("Setting user to loading");
          setUser({ ...user, guideStatus: GuideStatus.LOADING });
        } else setUser(user);
      }
    }
  }, []);

  useEffect(() => {
    if (user?.guideStatus === GuideStatus.LOADED) {
      handleShowFeedback(user);
    }
  }, [user]);

  const handleShowFeedback = (user: User) => {
    const showFeedback =
      user.guideItems !== undefined &&
      user.guideItems?.length > 0 &&
      user.hasReviewed === false &&
      user.guideStatus === GuideStatus.LOADED;
    setShowFeedback(showFeedback);
  };

  useEffect(() => {
    if (guideStatus === GuideStatus.LOADING && !isSubscribed.current) {
      isSubscribed.current = true;

      // Setup listener for guideStatus updates
      const unsubscribe = authStore.listenToUserGuideStatus((status, items) => {
        const guideItems = guideStore.getGuideItems();
        if (items.length > 0) {
          let itemToAdd = items[items.length - 1];

          if (
            itemToAdd.subItems &&
            itemToAdd.subItems?.length > 0 &&
            guideItems.find((item) => item.id === itemToAdd.id) !== undefined
          ) {
            itemToAdd = itemToAdd.subItems![itemToAdd.subItems!.length - 1];
            if (itemToAdd.subItems && itemToAdd.subItems?.length > 0) {
              itemToAdd = itemToAdd.subItems![itemToAdd.subItems!.length - 1];
            }
          }

          let isAlreadyAdded = false;
          for (const item of guideItems) {
            if (item.id === itemToAdd.id) {
              console.log("Item is already added to guide.");
              isAlreadyAdded = true;
              break;
            }
            if (item.subItems) {
              for (const subItem of item.subItems) {
                if (subItem.id === itemToAdd.id) {
                  console.log("Item is already added to guide.");
                  isAlreadyAdded = true;
                  break;
                }
                if (subItem.subItems) {
                  for (const subSubItem of subItem.subItems) {
                    if (subSubItem.id === itemToAdd.id) {
                      console.log("Item is already added to guide.");
                      isAlreadyAdded = true;
                      break;
                    }
                  }
                }
              }
            }
          }

          if (itemToAdd.id <= 3) {
            itemToAdd.expanded = true;
          }

          if (!isAlreadyAdded) addGuideItem(itemToAdd);
        } else {
          setGuideItems([]);
        }

        if (status === GuideStatus.LOADED) {
          setShowFeedback(true);
          setGuideStatus(GuideStatus.LOADED);
          console.log("Guide is loaded, unsubscribing from updates.");
          onGuideLoaded();
          unsubscribe?.();
          isSubscribed.current = false;
        }
      });

      // Cleanup function to unsubscribe
      return () => {
        isSubscribed.current = false;
        unsubscribe?.();
      };
    }
  }, [guideStatus]);

  const onGuideLoaded = () => {
    authStore
      .getUserOrCreateIfNotExists(authStore.user!.firebaseUser!)
      .then((updatedUser) => {
        setGuideStatus(GuideStatus.LOADED);
        authStore.setUser(updatedUser);
        setUser(updatedUser);
        handleShowFeedback(updatedUser);
      });
  };

  if (isMobileView) {
    return (
      <GuideMobileLayout
        status={guideStatus ?? GuideStatus.NONE}
        generateGuide={() => generateGuide(user!)}
      />
    );
  } else {
    return (
      <GuideDesktopLayout
        status={guideStatus ?? GuideStatus.NONE}
        generateGuide={() => generateGuide(user!)}
        showFeedback={showFeedback}
      />
    );
  }
};

export default observer(Guide);

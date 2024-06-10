import {
  signOut,
  User as FirebaseUser,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  getCountFromServer,
} from "firebase/firestore";
import { GuideStatus, User } from "../model/user";
import { auth, db } from "../../pages/_app";
import { makeObservable, observable, action } from "mobx";
import { GuideItem } from "../model/guide";

export default class AuthStore {
  open: boolean = false;
  user: User | null | undefined = undefined;
  fromPath?: string = undefined;
  hasCheckedAuth: boolean = false;

  constructor() {
    makeObservable(this, {
      open: observable,
      user: observable,
      fromPath: observable,
      hasCheckedAuth: observable,
      setOpen: action,
      signOut: action,
      checkAuth: action,
      setUser: action,
      setHasCheckedAuth: action,
      updateUserData: action,
      deleteAccount: action,
      setFromPath: action,
      sendSignInLink: action,
      confirmSignInWithEmailLink: action,
    });
  }

  initAuthListener = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const user = await this.getUserOrCreateIfNotExists(firebaseUser);
        this.setUser(user, firebaseUser);
      } else {
        // User is signed out
        this.setUser(undefined);
        console.log("User is signed out");
      }
      this.setHasCheckedAuth(true);
    });
  };

  checkAuth = () => {
    this.initAuthListener();
  };

  setHasCheckedAuth = (hasCheckedAuth: boolean) => {
    this.hasCheckedAuth = hasCheckedAuth;
  };

  setOpen = (open: boolean) => {
    this.open = open;
  };

  setFromPath = (fromPath: string | undefined) => {
    this.fromPath = fromPath;
  };

  updateUserData = async (user?: User): Promise<void> => {
    const newUser = user ?? this.user!;
    if (this.user) {
      const userData = {
        uid: newUser.uid,
        guideItems: newUser.guideItems,
        previousGuideItems:
          newUser.previousGuideItems ?? newUser.guideItems ?? [],
        questions: newUser.questions,
        usesKG: newUser.usesKG,
        usesCM: newUser.usesCM,
        credits: newUser.credits,
        guideStatus: newUser.guideStatus ?? GuideStatus.NONE,
        hasPaid: newUser.hasPaid ?? false,
        retries: newUser.retries ?? 0,
        hasReviewed: newUser.hasReviewed ?? false,
        hasDeclinedReview: newUser.hasDeclinedReview ?? false,
        fitnessLevel: newUser?.fitnessLevel ?? null,
      };

      this.setUser(newUser);

      // Here, userData contains all fields from the User object.
      return await updateDoc(doc(db, "users", this.user.uid), { ...userData });
    }
  };

  setUser = async (
    user: User | undefined,
    firebaseUser?: FirebaseUser | undefined
  ) => {
    if (user) {
      this.user = user;
    } else if (firebaseUser) {
      this.setOpen(false);
      this.user = await this.getUserOrCreateIfNotExists(firebaseUser);
    } else this.user = undefined;
  };

  signOut = () => {
    signOut(auth)
      .then(() => {
        this.setUser(undefined);
      })
      .catch((error) => {
        // An error happened.
      });
  };

  deleteAccount = () => {
    if (this.user) {
      auth.currentUser
        ?.delete()
        .then(() => {
          this.setUser(undefined);
        })

        .catch((error) => {
          // An error happened.
        });
    }
  };

  // Method to send sign-in link to email
  sendSignInLink = async (email: string, path: string): Promise<void> => {
    // Determine if the current environment is localhost
    const isLocal = window.location.hostname === "localhost";

    const actionCodeSettings = {
      // Dynamically set URL based on whether the code is running on localhost or not
      url: `${
        isLocal ? "http://localhost:3000" : "https://zone2guide.com"
      }${path}`,
      handleCodeInApp: true,
    };

    try {
      const confirmation = await sendSignInLinkToEmail(
        auth,
        email,
        actionCodeSettings
      );
      // The link was successfully sent. Inform the user.
      // Save email locally to complete sign-in when user returns.
      window.localStorage.setItem("emailForSignIn", email);
      // Assuming "confirmation" is used for something, otherwise, you might not need to return it.
      return confirmation;
    } catch (error: any) {
      console.error("Error sending email link:", error);
      return error;
    }
  };

  confirmSignInWithEmailLink = async (
    email: string,
    emailLink: string
  ): Promise<boolean> => {
    try {
      if (isSignInWithEmailLink(auth, emailLink)) {
        const result = await signInWithEmailLink(auth, email, emailLink);
        window.localStorage.removeItem("emailForSignIn");

        // Check if user exists in the Firestore and update/create as necessary
        const user = await this.getUserOrCreateIfNotExists(result.user);
        user.firebaseUser = result.user;
        // Update the user observable with the signed-in user's information
        this.setUser(user);

        console.log("Successfully signed in with email link!");
        return true; // Sign-in successful
      }
      return false; // Not a valid sign-in link
    } catch (error) {
      console.error("Error signing in with email link:", error);
      return false; // Error occurred during sign-in
    }
  };

  async getUserOrCreateIfNotExists(firebaseUser: FirebaseUser): Promise<User> {
    const uid = firebaseUser.uid;

    const userDocSnapshot = await getDoc(doc(db, "users/" + uid));

    const data = userDocSnapshot.data();

    try {
      if (!data) {
        const user = await this.createUser(uid);
        user.firebaseUser = firebaseUser;
        return user;
      } else {
        const user: User = {
          firebaseUser: firebaseUser,
          uid: data?.uid,
          credits: data?.credits,
          guideItems: data?.guideItems,
          previousGuideItems: data?.previousGuideItems,
          fitnessLevel: data?.fitnessLevel,
          questions: data?.questions,
          usesKG: data?.usesKG,
          usesCM: data?.usesCM,
          hasPaid: data?.hasPaid,
          guideStatus: data?.guideStatus,
          retries: data?.retries,
          hasReviewed: data?.hasReviewed,
          hasDeclinedReview: data?.hasDeclinedReview,
        };
        return user;
      }
    } catch (error) {
      console.error("Error checking/creating user document: ", error);
      throw error;
    }
  }

  async createUser(uid: string): Promise<User> {
    // Check firestore collection for amount of user documents
    const userCollection = collection(db, "users");
    const userCollectionSnapshot = await getCountFromServer(userCollection);
    const userCount = userCollectionSnapshot.data().count;

    const userData: User = {
      uid: uid,
      credits: 1000,
      guideItems: [],
      questions: [],
      usesKG: true,
      usesCM: true,
      hasPaid: false,
      guideStatus: userCount < 100 ? GuideStatus.FREEBIE : GuideStatus.NONE,
      retries: 0,
      hasReviewed: false,
      hasDeclinedReview: false,
    };
    await setDoc(doc(db, "users", uid), userData);

    return userData;
  }

  listenToUserGuideStatus = (
    onUpdate: (status: GuideStatus, items: GuideItem[]) => void
  ): Unsubscribe | void => {
    if (!this.user || !this.user.uid) {
      console.log("No user logged in");
      return;
    }

    console.log("listening to guide status");

    const userDocRef = doc(db, "users", this.user.uid);

    return onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data) {
            onUpdate(data.guideStatus, data.guideItems ?? []);
          }
        } else {
          console.log("User document does not exist");
        }
      },
      (error) => {
        console.error("Error listening to user guideStatus:", error);
      }
    );
  };
}

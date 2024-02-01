import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { User } from "../model/user";
import { auth, db, provider } from "../../pages/_app";
import { makeObservable, observable, action } from "mobx";

export default class AuthStore {
  open: boolean = false;
  user: User | null | undefined = undefined;
  fromPath?: string = undefined;

  constructor() {
    makeObservable(this, {
      open: observable,
      user: observable,
      fromPath: observable,
      setOpen: action,
      signOut: action,
      signInWithEmailAndPassword: action,
      createUserWithEmailAndPassword: action,
      signInWithGoogle: action,
      checkAuth: action,
      sendPasswordResetEmail: action,
      setUser: action,
      updateUserData: action,
      deleteAccount: action,
      setFromPath: action,
      sendSignInLink: action,
      confirmSignInWithEmailLink: action,
    });
  }

  checkAuth = () => {
    this.user = auth?.currentUser
      ? {
          uid: auth.currentUser.uid!,
          credits: 0,
          guideItems: [],
          questions: [],
          usesKG: true,
          usesCM: true,
        }
      : undefined;
  };

  setOpen = (open: boolean) => {
    this.open = open;
  };

  setFromPath = (fromPath: string | undefined) => {
    this.fromPath = fromPath;
  };

  updateUserData = async () => {
    if (this.user) {
      const exists = await this.getUserOrCreateIfNotExists(this.user.uid);

      const userData = {
        guideItems: this.user.guideItems,
        questions: this.user.questions,
        usesKG: this.user.usesKG,
        usesCM: this.user.usesCM,
        credits: this.user.credits,
      };

      // Here, userData contains all fields from the User object.
      updateDoc(doc(db, "users", this.user.uid), userData);
    }
  };

  setUser = (
    user: User | undefined,
    firebaseUser?: FirebaseUser | undefined
  ) => {
    if (user) {
      this.user = user;
    } else if (firebaseUser) {
      this.setOpen(false);
      this.getUserOrCreateIfNotExists(firebaseUser!.uid);
      this.user = {
        uid: firebaseUser.uid!,
        credits: 0,
        guideItems: [],
        questions: [],
        usesKG: true,
        usesCM: true,
      };
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

  signInWithEmailAndPassword = (
    email: string,
    password: string
  ): Promise<string | undefined> => {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        this.setUser(undefined, userCredential.user);
        this.setOpen(false);
        return;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        return error.message;
      });
  };

  createUserWithEmailAndPassword = (
    email: string,
    password: string
  ): Promise<string | undefined> => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        this.setUser(undefined, userCredential.user);
        this.setOpen(false);
        return;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        return error.message;
        // ..
      });
  };

  sendPasswordResetEmail = (email: string): Promise<string | undefined> => {
    return sendPasswordResetEmail(auth, email)
      .then((userCredential) => {
        // Signed in
        return;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        return error.message;
        // ..
      });
  };

  // Method to send sign-in link to email
  sendSignInLink = async (email: string, path: string): Promise<void> => {
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: `https://zone2-liard.vercel.app${path}`, // change this to your desired URL
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
        await this.getUserOrCreateIfNotExists(result.user.uid);

        // Update the user observable with the signed-in user's information
        this.setUser({
          uid: result.user.uid,
          credits: 0, // Or any default value
          guideItems: [],
          questions: [],
          usesKG: true,
          usesCM: true,
        });

        console.log("Successfully signed in with email link!");
        return true; // Sign-in successful
      }
      return false; // Not a valid sign-in link
    } catch (error) {
      console.error("Error signing in with email link:", error);
      return false; // Error occurred during sign-in
    }
  };

  signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        this.setUser(undefined, result.user);

        this.setOpen(false);

        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  async getUserOrCreateIfNotExists(uid: string): Promise<void> {
    const userDocSnapshot = await getDoc(doc(db, "users/" + uid));

    const data = userDocSnapshot.data();
    try {
      if (!data) {
        const userData: User = {
          uid: uid,
          credits: 1000,
          guideItems: [],
          questions: [],
          usesKG: false,
          usesCM: false,
        };
        this.setUser(userData);
        await setDoc(doc(db, "users", uid), userData);

        console.log("User document created successfully.");
      } else {
        const user: User = {
          uid: data?.uid,
          credits: data?.credits,
          guideItems: [],
          questions: [],
          usesKG: false,
          usesCM: false,
        };
        this.setUser(user);
      }
    } catch (error) {
      console.error("Error checking/creating user document: ", error);
    }
  }
}

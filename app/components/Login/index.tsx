import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { useStore } from "@/RootStoreProvider";
import { isSignInWithEmailLink } from "firebase/auth";
import { auth } from "@/pages/_app";
import { Send as SendIcon } from "@mui/icons-material";

export default function Login() {
  const { authStore } = useStore();

  const router = useRouter();

  const isGuide = router.pathname === "/zone2guide";

  const [emailSent, setEmailSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(undefined);
    }
  }, [email]);

  const handleSendLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true); // Start loading
    try {
      const path = router.pathname;
      await authStore.sendSignInLink(email, path);
      setEmailSent(true);
      setMessage(
        "We've sent a sign-in link to your email. Please check your inbox and follow the instructions to complete the sign-up process."
      );
    } catch (error: any) {
      setMessage("Error sending email: " + error.message);
    } finally {
      setLoading(false); // Stop loading regardless of the outcome
    }
  };

  useEffect(() => {
    const currentUrl = window.location.href;
    if (isSignInWithEmailLink(auth, currentUrl) && !authStore.user) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }
      if (email) {
        authStore
          .confirmSignInWithEmailLink(email, currentUrl)
          .then((isSignedIn) => {
            if (isSignedIn) {
              authStore.setOpen(false);
            }
          })
          .catch((error) => {
            setMessage("Error signing in: " + error.message);
          });
      }
    }
  }, [router]);

  return (
    <div
      className="flex text-whitebg"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10001,
        textShadow: "10px 10px 10px rgba(0,0,0,1)",
      }}
    >
      <div className="p-10 xs:p-0 mx-auto w-full md:max-w-md">
        <IconButton
          sx={{
            position: "relative",
            top: 0,
            right: 12,
            cursor: "pointer",
            color: "white",
            float: "right",
            zIndex: 10001,
          }}
          onClick={() => {
            if (router.pathname !== "/") return;
            authStore.setOpen(false);
            authStore.setFromPath(undefined);
          }}
        >
          <CloseIcon className="my-2" />
        </IconButton>
        <div className="bg-black bg-opacity-80 p-8 rounded-lg border border-gray-700 text-whitebg">
          <div className="px-5 pt-7">
            <h2 className="text-3xl font-bold mb-6">
              {emailSent
                ? "Email Sent!"
                : `Please sign up ${isGuide ? "to get your guide" : ""}`}
            </h2>
            {!message ? (
              <form onSubmit={handleSendLink} className="flex flex-col gap-6">
                <input
                  type="email"
                  id="email"
                  className="border-2 text-whitebg border-gray-700 p-3 rounded-lg focus:outline-none focus:border-white bg-black transition duration-300"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={true}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="submit"
                  className="bg-whitebg hover:bg-gray-300 text-black p-3 rounded-lg transition duration-300 flex justify-center items-center"
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <div className="flex w-full justify-center items-center">
                      <SendIcon
                        className="mr-2"
                        style={{ color: "black", fontSize: "1.25rem" }}
                      />
                      <p>Send Email</p>
                      {/* <SendIcon
                        style={{ color: "black", fontSize: "1.25rem" }}
                      /> */}
                    </div>
                  )}
                </button>
                <p className="text-sm">
                  If you already have an account, we&apos;ll log you in
                </p>
              </form>
            ) : (
              <div className="mt-4">
                <p className="text-whitebg">{message}</p>
              </div>
            )}
          </div>
        </div>
        {errorMessage && (
          <div className="text-red-500 text-sm text-center pb-5">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

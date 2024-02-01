import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import { useStore } from "@/RootStoreProvider";

export default function Login() {
  const { authStore } = useStore();

  const router = useRouter();

  const [register, setRegister] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [forgotPassword, setForgotPassword] = useState(false);

  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

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
    try {
      await authStore.sendSignInLink(email);
      setMessage("Check your email for the sign-in link.");
    } catch (error: any) {
      setMessage("Error sending email: " + error.message);
    }
  };

  return (
    <div
      className="flex text-white"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        // center the modal
        minWidth: 448,
        maxHeight: 524,
        zIndex: 10001,
        textShadow: "10px 10px 10px rgba(0,0,0,1)",
      }}
    >
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
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
            authStore.setOpen(false);
            authStore.setFromPath(undefined);
          }}
        >
          <CloseIcon className="my-2" />
        </IconButton>
        <div className="bg-black bg-opacity-60 p-8 rounded-lg text-white">
          <div className="px-5 pt-7">
            <h2 className="text-3xl font-bold mb-6">Sign in</h2>
            <form onSubmit={handleSendLink} className="flex flex-col gap-6">
              <input
                type="email"
                id="email"
                className="border-2 text-black border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition duration-300"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={true}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="submit"
                onClick={(e) => e.stopPropagation()}
                className="bg-blue-600 hover:bg-blue-800 text-white p-3 rounded-lg transition duration-300"
              >
                Send Email
              </button>
              <p className="text-sm">
                If you already have an account, we&apos;ll log you in
              </p>
            </form>
            {message && <p className="mt-4 text-red-500">{message}</p>}
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

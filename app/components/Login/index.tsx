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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const onRegister = async () => {
    setLoading(true);

    const error = await authStore.createUserWithEmailAndPassword(
      email,
      password
    );
    setLoading(false);
    if (error) {
      setErrorMessage(error);
    } else if (authStore.fromPath) {
      router.push(authStore.fromPath);
      authStore.setFromPath(undefined);
    }
  };

  const onLogin = async () => {
    setLoading(true);
    const error = await authStore.signInWithEmailAndPassword(email, password);
    setLoading(false);
    if (error) {
      setErrorMessage(error);
    } else if (authStore.fromPath) {
      router.push(authStore.fromPath);
      authStore.setFromPath(undefined);
    }
  };

  const onResetPassword = async () => {
    setLoading(true);

    const error = await authStore.sendPasswordResetEmail(email);
    setLoading(false);
    if (error) {
      setErrorMessage(error);
    } else setResetPasswordSuccess(true);
  };

  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(undefined);
    }
  }, [email, password]);

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13) {
      if (forgotPassword) onResetPassword();
      else register ? onRegister() : onLogin();
    }
  };

  if (forgotPassword)
    return (
      <div
        className="flex"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          // center the modal
          width: 448,
          maxHeight: 524,
          zIndex: 10001,
        }}
      >
        <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
          <IconButton
            sx={{
              position: "relative",
              top: 0,
              right: 12,
              cursor: "pointer",
              color: "gray",
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
          <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200 md:w-full w-px-[300]">
            <div className="px-5 pt-7 pb-7">
              <label className="font-semibold text-sm text-gray-600 pb-1 block">
                E-mail
              </label>

              <input
                type="email"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
                autoFocus={register}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {resetPasswordSuccess && (
                <div className="text-green-500 text-sm text-center pb-5">
                  E-post sendt
                </div>
              )}
              {errorMessage && (
                <div className="text-red-500 text-sm text-center pb-5">
                  {errorMessage}
                </div>
              )}
              <button
                id="Omstill passord"
                type="button"
                className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
                onClick={onResetPassword}
                disabled={loading || resetPasswordSuccess}
                style={{
                  backgroundColor: "#57b8ca",
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <span className="inline-block mr-2">Omstill passord</span>
                )}
              </button>
            </div>

            <div className="py-5">
              <div className="grid grid-cols-1 gap-1">
                <div className="text-center whitespace-nowrap">
                  <button
                    className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset"
                    onClick={() => setForgotPassword(false)}
                  >
                    <span className="inline-block ml-1">Logg inn</span>
                  </button>
                </div>
                {/* <div className="text-center sm:text-right whitespace-nowrap">
                <button className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-4 h-4 inline-block align-text-bottom	"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="inline-block ml-1">Help</span>
                </button>
              </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className="flex"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        // center the modal
        width: 448,
        maxHeight: 524,
        zIndex: 10001,
      }}
    >
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <IconButton
          sx={{
            position: "relative",
            top: 0,
            right: 12,
            cursor: "pointer",
            color: "gray",
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
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200 md:w-full w-px-[300]">
          <div className="px-5 pt-7">
            {authStore.fromPath && (
              <p className="py-5 text-sm text-gray-600 text-center">
                Du må logge inn for å få tilgang til verktøy
              </p>
            )}
            <label className="font-semibold text-sm text-gray-600 pb-1 block">
              E-mail
            </label>
            <input
              type="email"
              className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              autoFocus={register}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="font-semibold text-sm text-gray-600 pb-1 block">
              Password
            </label>
            <div className="relative pb-6">
              <input
                type={showPassword ? "text" : "password"}
                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="absolute top-0 right-0 mt-2 mr-2 focus:outline-none pt-1.5"
                onClick={toggleShowPassword}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errorMessage && (
              <div className="text-red-500 text-sm text-center pb-5">
                {errorMessage}
              </div>
            )}
            <button
              id={register ? "Registrer deg" : "Logg inn"}
              type="button"
              className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              onClick={register ? onRegister : onLogin}
              style={{
                background: "#57b8ca",
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <span className="inline-block mr-2">
                  {register ? "Registrer deg" : "Logg inn"}
                </span>
              )}
            </button>
            <div className="text-center whitespace-nowrap">
              <button
                id={register ? "Logg inn" : "Registrer deg"}
                onClick={() => setRegister(!register)}
                className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset"
              >
                <span className="inline-block ml-1">
                  {register ? "Logg inn" : "Registrer deg"}
                </span>
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 gap-1">
              {/* <button
                type="button"
                className="transition duration-200 border border-gray-200 text-gray-500 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-normal text-center inline-block"
              >
                MailUp
              </button> */}
              <button
                type="button"
                className="transition duration-200 border border-gray-200 text-gray-500 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-normal text-center inline-block"
                onClick={() => authStore.signInWithGoogle()}
              >
                Google
              </button>
              {/* <button
                type="button"
                className="transition duration-200 border border-gray-200 text-gray-500 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-normal text-center inline-block"
              >
                Github
              </button> */}
            </div>
          </div>
          <div className="py-5">
            <div className="grid grid-cols-1 gap-1">
              <div className="text-center whitespace-nowrap">
                <button
                  className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset"
                  onClick={() => setForgotPassword(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-4 h-4 inline-block align-text-top"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="inline-block ml-1">Glemt Passord</span>
                </button>
              </div>
              {/* <div className="text-center sm:text-right whitespace-nowrap">
                <button className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-4 h-4 inline-block align-text-bottom	"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="inline-block ml-1">Help</span>
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

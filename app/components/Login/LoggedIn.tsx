import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { observer } from "mobx-react";
import { useStore } from "@/RootStoreProvider";

function LoggedIn() {
  const { authStore } = useStore();

  const { user, updateUserData, open } = authStore;

  const [name, setName] = useState(user!.displayName ?? "Ola Nordmann");

  const [subscribed, setSubscribed] = useState(user!.subscribed! ?? true);

  const [deleteAccount, setDeleteAccount] = useState(false);

  function handleBlur() {
    updateUserData(name, subscribed);
  }

  useEffect(() => {
    handleBlur();
  }, [subscribed]);

  return (
    <div
      className="flex "
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        // center the modal
        width: 448,
        height: 524,
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
            zIndex: 100011,
          }}
          onClick={() => {
            handleBlur();
            authStore.setOpen(false);
          }}
        >
          <CloseIcon className="my-2" />
        </IconButton>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
          {deleteAccount ? (
            <div className="p-5 py-20 md:w-full w-px-[300]">
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
                  onClick={() => {
                    authStore.deleteAccount();
                    authStore.setUser(undefined);
                    authStore.setOpen(false);
                  }}
                >
                  Slett konto
                </button>
                {/* <button
                 type="button"
                 className="transition duration-200 border border-gray-200 text-gray-500 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-normal text-center inline-block"
               >
                 Github
               </button> */}
              </div>
            </div>
          ) : (
            <div className="md:w-full w-px-[300]">
              <div className="px-5 pt-7">
                <label className="font-semibold text-sm text-gray-600 pb-1 block">
                  Navn
                </label>
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleBlur}
                />
                <label className="font-semibold text-sm text-gray-600 pb-1 block">
                  E-mail
                </label>
                <div className="relative pb-6">
                  <input
                    type={"text"}
                    className="border rounded-lg px-3 py-2 mt-1 text-sm w-full"
                    value={user!.email}
                    disabled={true}
                  />
                </div>
                <div className="px-0 pb-6">
                  <FormGroup>
                    <FormControlLabel
                      className="text-sm text-gray-600"
                      control={
                        <Checkbox
                          style={{
                            color: "#57b8ca",
                          }}
                          checked={subscribed}
                          onChange={(e) => {
                            setSubscribed(e.target.checked);
                          }}
                        />
                      }
                      label="Abonner på nyhetsbrev"
                    />
                  </FormGroup>
                </div>
                <p className="px-0 pb-5 text-m text-gray-600">
                  Kreditter: <strong>{user?.credits}</strong>
                </p>
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
                    onClick={() => authStore.signOut()}
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
                    </svg>{" "}
                    Logg ut
                  </button>
                  {/* <button
                type="button"
                className="transition duration-200 border border-gray-200 text-gray-500 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-normal text-center inline-block"
              >
                Github
              </button> */}
                </div>
              </div>
              <div className="pb-5">
                <div className="grid grid-cols-1 gap-1">
                  <div className="text-center whitespace-nowrap">
                    <button
                      className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset"
                      onClick={() => setDeleteAccount(true)}
                    >
                      <span className="inline-block ml-1">Slett konto</span>
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
          )}
        </div>
      </div>
    </div>
  );
}

export default observer(LoggedIn);

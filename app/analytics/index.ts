import { firebaseAnalytics } from "@/pages/_app";
import { getAnalytics, logEvent } from "firebase/analytics";

export function logPageView() {
  if (window && typeof window !== "undefined") {
    logEvent(firebaseAnalytics!, "page_view", {
      page_path: window.location.pathname,
    });
  }
}

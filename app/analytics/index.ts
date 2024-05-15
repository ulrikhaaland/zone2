import { getAnalytics, logEvent } from "firebase/analytics";

export const firebaseAnalytics = getAnalytics();

export function logPageView() {
  if (typeof window !== "undefined") {
    logEvent(firebaseAnalytics, "page_view", {
      page_path: window.location.pathname,
    });
  }
}

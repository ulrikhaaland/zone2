import AuthStore from "./auth.store";
import GeneralStore from "./general.store";
import GuideStore from "./guide.store";

class RootStore {
  authStore: AuthStore;
  generalStore: GeneralStore;
  guideStore: GuideStore;

  constructor() {
    this.authStore = new AuthStore();
    this.generalStore = new GeneralStore();
    this.guideStore = new GuideStore();
  }
}

export default RootStore;

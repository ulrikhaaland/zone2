import AuthStore from "./auth.store";
import GeneralStore from "./general.store"; 

class RootStore {
  authStore: AuthStore;
  generalStore: GeneralStore; 

  constructor() {
    this.authStore = new AuthStore();
    this.generalStore = new GeneralStore(); 
  }
}

export default RootStore;

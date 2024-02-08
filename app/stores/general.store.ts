import { action, makeObservable, observable } from "mobx";

class GeneralStore {
  isMobileView: boolean = false;

  constructor() {
    makeObservable(this, {
      isMobileView: observable,
      setIsMobileView: action,
    });
  }

  setIsMobileView = (isMobileView: boolean) => {
    this.isMobileView = isMobileView;
  };
}

export default GeneralStore;

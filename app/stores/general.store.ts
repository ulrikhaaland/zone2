import { action, makeObservable, observable } from "mobx";
import { RefObject, useRef } from "react";

class GeneralStore {
  isMobileView: boolean = false;
  scrollableContentRef?: RefObject<any> = undefined;

  constructor() {
    makeObservable(this, {
      isMobileView: observable,
      scrollableContentRef: observable,
      setScrollableContentRef: action,
      setIsMobileView: action,
    });
  }

  setScrollableContentRef = (scrollableContentRef: RefObject<any>) => {
    this.scrollableContentRef = scrollableContentRef;
  };

  setIsMobileView = (isMobileView: boolean) => {
    this.isMobileView = isMobileView;
  };
}

export default GeneralStore;

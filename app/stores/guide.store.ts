import { makeAutoObservable } from "mobx";
import { GuideItem, appendGuideItem } from "../model/guide";

export default class GuideStore {
  guideItems: GuideItem[] = [];

  constructor() {
    makeAutoObservable(this);
    this.setGuideItems = this.setGuideItems.bind(this); // Bind the method
    this.addGuideItem = this.addGuideItem.bind(this); // Bi
  }

  setGuideItems(items: GuideItem[]) {
    this.guideItems = items;
  }

  addGuideItem(item: GuideItem) {
    appendGuideItem(this.guideItems, item);
  }
  getGuideItems() {
    return this.guideItems;
  }
}

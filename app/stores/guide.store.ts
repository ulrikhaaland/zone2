import { makeAutoObservable } from "mobx";
import { GuideItem, appendGuideItem } from "../model/guide";

export default class GuideStore {
  guideItems: GuideItem[] = [];
  guideItemsCount = 0;

  constructor() {
    makeAutoObservable(this);
    this.setGuideItems = this.setGuideItems.bind(this); // Bind the method
    this.addGuideItem = this.addGuideItem.bind(this); // Bi
  }

  setGuideItems(items: GuideItem[]) {
    this.guideItems = items;
    this.setGuideItemsCount();
  }

  addGuideItem(item: GuideItem) {
    appendGuideItem(this.guideItems, item, true);
    this.setGuideItemsCount();
  }

  getGuideItems() {
    return this.guideItems;
  }

  setGuideItemsCount() {
    let count = 0;
    this.guideItems.forEach((item) => {
      count++;
      if (item.subItems) {
        count += item.subItems.length;
      }
    });
    this.guideItemsCount = count;
  }
}

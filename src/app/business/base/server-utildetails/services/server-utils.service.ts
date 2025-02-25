import { Injectable } from "@angular/core";

@Injectable()
export class ServerUtilsService {
  private _items = {} as any;

  addItem(item) {
    this._items = item;
    console.log(this._items);
  }

  getItems() {
    console.log("from get items", this._items);
    return this._items;
  }
}

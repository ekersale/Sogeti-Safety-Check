import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {APIService} from "../../services/server";
import {FormControl} from "@angular/forms";


@Component({
  selector: 'page-google-map-modal',
  templateUrl: 'google-map-modal.html',
  providers : [APIService],
})
export class GoogleMapModal{

  public items = [];
  public showList : Boolean;
  public searchValue = '';
  public searchControl : FormControl;
  public searching: any = false;
  public perimeterValue = 0;
  private placeSelected;
  public radio;

  constructor(public viewCtrl: ViewController, private api : APIService) {
    this.showList = false;
    this.searchControl = new FormControl();
  }

  ionViewDidLoad() {
    this.getItems();
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this.searching = false;
      this.getItems();
    })
  }

  dismiss() {
      this.viewCtrl.dismiss({ position : "coucou" });
  }

  getItems() {
    this.showList = true;
    console.log(this.searchValue);
    this.api.getGeolocByPlace((this.searchValue == '') ? 'France' : this.searchValue ).subscribe(
      data => {
        this.items = data.data.predictions;
          console.log(this.items);
      },
      error => console.log(error)
    )
  }

  selectedItem(item) {
    console.log(item);
    this.showList = false;
    this.placeSelected = item;
    this.searchValue = item.description;
  }

  searchInput() {
    this.searching = true;
  }

  onCancel() {
    this.items = [];
    this.searchValue = "";
    this.showList = false;
  }

  returnValues() {
    this.viewCtrl.dismiss({ place : this.placeSelected, perimeterValue : this.perimeterValue });
  }
}

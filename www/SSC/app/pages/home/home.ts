import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ViewController, Platform} from 'ionic-angular';


@Component({
  template: `
    <ion-header style="background: rgb(239, 69, 39);">
        <ion-searchbar></ion-searchbar>
    </ion-header>
    <ion-content>
    </ion-content>
`})
export class TabIconTextPage {
  isAndroid: boolean = false;

  constructor(platform: Platform) {
    this.isAndroid = platform.is('android');
  }
}


@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  tabOne = TabIconTextPage;
  tabTwo = TabIconTextPage;
  tabThree = TabIconTextPage;
  tabFour = TabIconTextPage;
  isAndroid: boolean = false;

  constructor(public navCtrl: NavController, platform: Platform) {
    this.isAndroid = platform.is('android');

  }
}

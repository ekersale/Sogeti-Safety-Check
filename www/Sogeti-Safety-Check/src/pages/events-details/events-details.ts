import { Component } from '@angular/core';
import {ViewController, NavParams, Platform} from 'ionic-angular';
import { Keyboard } from 'ionic-native';

@Component({
  selector: 'page-events-details',
  templateUrl: 'events-details.html'
})

export class EventsDetails {

  event;

  constructor(public viewCtrl: ViewController, public data : NavParams, platform : Platform) {
    this.event = data.get('event');
    if (platform.is('ios')) {
      Keyboard.hideKeyboardAccessoryBar(true);
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
    Keyboard.hideKeyboardAccessoryBar(false);
  }
}

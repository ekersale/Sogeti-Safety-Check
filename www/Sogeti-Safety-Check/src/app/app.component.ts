import { Component } from '@angular/core';
import {Platform} from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import {Splashscreen} from 'ionic-native';
import {TabsPage} from '../pages/tabs/tabs';
import {Keyboard} from "ionic-native";
import {APIService} from '../services/server';

import { LoginPage } from '../pages/login/login';
import { Geolocation, Geoposition } from 'ionic-native';

import 'rxjs';

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`,
  providers: [APIService]
})
export class MyApp {
  rootPage : any;

  constructor(private platform: Platform, private api: APIService) {

   this.api.isUserLog().subscribe(
      data => this.rootPage = TabsPage,
      err => this.rootPage = LoginPage
   );

    Geolocation.getCurrentPosition().then(
      pos => {
        this.api.putUserPosition((pos as Geoposition).coords).subscribe();
      }
    );

    platform.ready().then(() => {
      Keyboard.hideKeyboardAccessoryBar(false);
      StatusBar.overlaysWebView(true); // let status bar overlay webview
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      Splashscreen.hide();
      StatusBar.styleDefault();
      StatusBar.show();
    });
  }



  initializeApp() {
    this.platform.ready().then(() => {
      this.hideSplashScreen();

    });
  }

  hideSplashScreen() {
    if (Splashscreen) {
      setTimeout(() => {
        Splashscreen.hide();
      }, 100);
    }
  }
}

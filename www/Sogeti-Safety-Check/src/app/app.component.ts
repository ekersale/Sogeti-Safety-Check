import { Component } from '@angular/core';
import {Platform, Tab} from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import {Splashscreen} from 'ionic-native';
import {TabsPage} from '../pages/tabs/tabs';
import {Keyboard} from "ionic-native";
import {APIService} from '../services/server';

import { LoginPage } from '../pages/login/login';


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`,
  providers: [APIService]
})
export class MyApp {
  rootPage : any;

  constructor(private platform: Platform, private api: APIService) {
    if (api.isUserLog()) {
      this.rootPage = TabsPage;
    }
    else {
      this.rootPage = LoginPage;
    }
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
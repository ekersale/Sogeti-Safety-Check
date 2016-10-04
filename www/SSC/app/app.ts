import { Component } from '@angular/core';
import { Platform, ionicBootstrap } from 'ionic-angular';
import { LoginPage } from './pages/login/login';
import {provideForms, disableDeprecatedForms} from '@angular/forms';
import {StatusBar} from "ionic-native";
import {HomePage} from './pages/home/home'

@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
})

export class MyApp {

  public rootPage: any;

  constructor(private platform: Platform) {
    this.rootPage = LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}
ionicBootstrap(MyApp, [
      provideForms(),
      disableDeprecatedForms()
    ]
);
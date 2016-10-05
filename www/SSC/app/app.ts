import { Component } from '@angular/core';
import { Platform, ionicBootstrap } from 'ionic-angular';
import { LoginPage } from './pages/login/login';
import {provideForms, disableDeprecatedForms} from '@angular/forms';
import {StatusBar} from "ionic-native";
import {HomePage} from './pages/home/home'
import {Splashscreen} from 'ionic-native';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
})

export class MyApp {

  public rootPage: any;

  constructor(private platform: Platform) {
    this.rootPage = LoginPage;

    platform.ready().then(() => {
        Splashscreen.hide();
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
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
ionicBootstrap(MyApp, [
      provideForms(),
      disableDeprecatedForms()
    ]
);

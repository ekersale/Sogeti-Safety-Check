import {Component} from "@angular/core";
import {Platform, App} from "ionic-angular";
import {StatusBar, Splashscreen, Keyboard, Geolocation, Geoposition} from "ionic-native";
import {TabsPage} from "../pages/tabs/tabs";
import {APIService} from "../services/server";
import {LoginPage} from "../pages/login/login";
import "rxjs";

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`,
  providers: [APIService]
})
export class MyApp {
  rootPage : any;

  constructor(private platform: Platform, private api: APIService, public app: App) {


    platform.ready().then(() => {
      Keyboard.hideKeyboardAccessoryBar(false);
      StatusBar.overlaysWebView(true); // let status bar overlay webview
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      Splashscreen.hide();
      StatusBar.styleDefault();
      StatusBar.show();
      //Registration of push in Android and Windows Phone
      this.registerBackButtonListener();
    });

    Geolocation.getCurrentPosition().then(
      pos => {
        this.api.putUserPosition((pos as Geoposition).coords).subscribe();
      }
    );


    this.api.isUserLog().subscribe(
      data => this.rootPage = TabsPage,
      err => this.rootPage = LoginPage
    );


  }

  registerBackButtonListener() {
    document.addEventListener('backbutton', () => {if (this.app.getActiveNav().canGoBack()) { this.app.getActiveNav().pop() }});
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

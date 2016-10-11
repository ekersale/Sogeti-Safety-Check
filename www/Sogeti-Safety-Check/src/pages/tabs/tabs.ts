import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import { Platform} from 'ionic-angular';
import {StatusBar} from "ionic-native";
import { TabProfilePage } from '../profile/profile';
import {TabChatPage} from '../chat/chat';
import {TabHomePage} from '../home/home';
import {APIService} from '../../services/server';

@Component({
  templateUrl: 'tabs.html',
  providers: [APIService]
})
export class TabsPage {
  tabOne: any = TabHomePage;
  tabTwo: any = TabChatPage;
  tabFour: any = TabProfilePage;

  constructor(public navCtrl: NavController, platform: Platform, public api : APIService) {
    platform.ready().then(() => {
      StatusBar.overlaysWebView(false); // let status bar overlay webview
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#ef4527'); // set status bar to white
    });
    platform.registerBackButtonAction((e) => { e.preventDefault();}, 501);
  }

  onViewDidLoad() {

  }
}

import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import { Platform} from 'ionic-angular';
import {StatusBar} from "ionic-native";
import { TabProfilePage } from '../profile/profile';
import {TabChatPage} from '../chat/chat';
import {TabHomePage} from '../home/home';
import {APIService} from '../../services/server';
import {Push} from 'ionic-native';
import { LocalNotifications } from 'ionic-native';


@Component({
  templateUrl: 'tabs.html'
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
      this.initPushNotification();
    });
    platform.registerBackButtonAction((e) => { e.preventDefault();}, 501);
  }

  initPushNotification() {
    let push = Push.init({
      android: {
        senderID: "231350961258"
      },
      ios: {
        alert: "true",
        badge: false,
        sound: "true"
      },
      windows: {}
    });

    push.on('registration', (data) => {
      this.api.postTokenPushNotification(data.registrationId, true).subscribe();
    });
    push.on('notification', (data) => {
      alert(data.message);
      LocalNotifications.schedule({
        id: 1,
        title: data.title,
        text: data.message,
        icon: 'http://icons.iconarchive.com/icons/fps.hu/free-christmas-flat-circle/256/bell-icon.png'
      });
    });
    push.on('data', (data) => {
      console.log(data);
    });
    push.on('error', (e) => {
      alert(e.message);
    });
  }

  onViewDidLoad() {

  }
}

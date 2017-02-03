import { Component } from '@angular/core';
import {ViewController, NavParams, Platform} from 'ionic-angular';
import {APIService} from "../../services/server";

/*
  Generated class for the PreviewEvent page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-preview-event',
  templateUrl: 'preview-event.html'
})
export class PreviewEvent {

  user : string = "http://simpleicon.com/wp-content/uploads/user1.svg";
  event : any = {};
  images : string[] = [];
  mySlideOptions = {
    initialSlide: 0,
    loop: true
  };

  constructor(public viewCtrl: ViewController, private navParams : NavParams, private api : APIService,
              private platform: Platform) {
    platform.ready().then(() => {
      this.registerBackButtonListener();
    })
    this.event = navParams.get('event');
    this.images = navParams.get('images');
  }

  registerBackButtonListener() {
    document.addEventListener('backbutton', () => { this.viewCtrl.dismiss()});
  }


  ionViewDidLoad() {
    console.log('Hello PreviewEvent Page');
    this.api.getUserInfo(null).subscribe(
      data => {
        this.user = data.data.user.profileImg.relativePath;
      },
      error => alert(error)
    )
  }

  send() {
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}

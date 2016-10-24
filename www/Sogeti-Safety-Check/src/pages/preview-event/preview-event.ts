import { Component } from '@angular/core';
import {ViewController, NavParams} from 'ionic-angular';
import {APIService} from "../../services/server";

/*
  Generated class for the PreviewEvent page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-preview-event',
  templateUrl: 'preview-event.html',
  providers: [APIService]
})
export class PreviewEvent {

  user : string = "http://simpleicon.com/wp-content/uploads/user1.svg";
  event : any = {};
  images : string[] = [];
  mySlideOptions = {
    initialSlide: 0,
    loop: true
  };

  constructor(public viewCtrl: ViewController, private navParams : NavParams, private api : APIService) {
    this.event = navParams.get('event');
    this.images = navParams.get('images');
    console.log(this.event);

  }

  ionViewDidLoad() {
    console.log('Hello PreviewEvent Page');
    this.api.getUserInfo().subscribe(
      data => {
        this.user = data.data.user.profileImg.relativePath;
        console.log(this.user);
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

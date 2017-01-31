import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {APIService} from "../../services/server";


@Component({
  selector: 'page-talk',
  templateUrl: 'talk.html'
})
export class Talk {

  talkID : string;
  talkDetail : any;
  talkName : string;
  message : string;
  tabBarElement: any;
  contacts : any;

  constructor(public navCtrl: NavController, private navParams: NavParams, private api : APIService) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.talkID = navParams.get('contact')._id;
    this.talkName = navParams.get('contact').participants[0].name.first + " " + navParams.get('contact').participants[0].name.last ;
    this.getMessage();
  }

  getMessage() {
    this.api.getTalk(this.talkID).subscribe(
      data => {
        this.talkDetail = data.data.talk;
      },
      error => {}
    );
    this.api.recv.subscribe(data =>{
        this.talkDetail.history.push(data);
    });
  }

  sendMessage(message) {
    this.api.sendSocketMessage({message : message.value, client: this.talkDetail.participants, id: this.talkID });
    message.value = "";
  };

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
    this.tabBarElement.style.visibility = 'hidden';
  }

  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
    this.tabBarElement.style.visibility = 'visible';
  }

  ionViewWillLoad() {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.tabBarElement.style.display = 'none';
    this.tabBarElement.style.visibility = 'hidden';
  }

  onInputKeypress() {

  }

  ionViewDidLoad() {
    console.log('Hello Talk Page');
  }

}

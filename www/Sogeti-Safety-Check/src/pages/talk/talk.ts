import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {APIService} from "../../services/server";

@Component({
  selector: 'page-talk',
  templateUrl: 'talk.html',
})
export class Talk  {

  talkID : string;
  talkDetail : any;
  talkName : string;
  message : string;
  tabBarElement: any;
  contacts : any;
  @ViewChild('content') content: Content;
  @ViewChild('focusable') input;

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
    this.api.recv.subscribe(data => {
      if (data.id == this.talkID) {
        this.talkDetail.history.push(data);
        this.scrollToBottom();
        this.input.setFocus();
      }
    });
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
      this.content.scrollToBottom(200);},200);
    } catch(err) { }
  }

  sendMessage(message) {
    this.api.sendSocketMessage({message : message.value, client: this.talkDetail.participants, id: this.talkID });
    message.value = "";
    this.input.setFocus();
  };

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
    this.tabBarElement.style.visibility = 'hidden';
  }

  ionViewDidEnter() {
    this.api.readMessage(this.talkID);
    setTimeout(() => {
      this.input.setFocus();
    },200);
    setTimeout(() => {
      this.scrollToBottom();
    }, 400);
  }

  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
    this.tabBarElement.style.visibility = 'visible';
    this.api.readMessage(this.talkID);
  }

  ionViewWillLoad() {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.tabBarElement.style.display = 'none';
    this.tabBarElement.style.visibility = 'hidden';
  }

}

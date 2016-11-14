import { Component } from '@angular/core';
import {NavController, NavParams, ViewController, ModalController} from 'ionic-angular';
import {APIService} from '../../services/server'
import {TabProfilePage} from "../profile/profile";

@Component({
  selector: 'page-user-pop-over',
  templateUrl: 'user-pop-over.html',
  providers: [APIService]
})
export class UserPopOver {

  private presents = [];
  private event;

  constructor(public navCtrl: NavController, private api : APIService, public params : NavParams,
              private viewCtrl : ViewController, private modalCtrl : ModalController) {
    this.event = params.get('event');
  }

  ionViewDidLoad() {
    console.log('Hello UserPopOver Page');
  }

  ionViewWillEnter() {
    this.api.getParticipants(this.params.get('event')._id).subscribe(
      data => {
        this.presents = data.data.participants;
      },
      error => console.log(error)
    );
  }

  openProfile(userID) {
    this.viewCtrl.dismiss();
    this.modalCtrl.create(TabProfilePage, {userID: userID}).present();
  }

  close() {
    this.viewCtrl.dismiss();
  }

}

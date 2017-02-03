/**
 * Created by ekersale on 05/10/2016.
 */

import {Component} from '@angular/core';
import {APIService} from '../../services/server'
import {NavController, ToastController, ModalController, NavParams, ViewController, Platform} from "ionic-angular";
import {LoginPage} from "../login/login"
import {App} from 'ionic-angular';
import {EventsDetails} from '../events-details/events-details'

@Component({
  templateUrl: 'profile.html'
})


export class TabProfilePage {

  public name = { first: '', last: ''};
  public function : string = '';
  public state: string = '';
  public phone: string = '';
  public email: string = '';
  public profileImg: string = 'https://case.edu/medicine/admissions/media/school-of-medicine/admissions/classprofile.png';
  public events = [];
  public displayReturnButton: boolean = false;
  constructor(private api: APIService, public navCtrl: NavController, private _app : App, private toastCtrl : ToastController,
              private modalCtrl : ModalController, public data : NavParams, public viewCtrl : ViewController, private platform: Platform) {
    if (this.data.get('userID')) {
      this.displayReturnButton = true;
    }
    platform.ready().then(() => this.registerBackButtonListener());
  }

  registerBackButtonListener() {
    document.addEventListener('backbutton', () => { this.viewCtrl.dismiss()});
  }


  ionViewWillEnter() {
    let request;
    if (this.data.get('userID'))
      request = this.api.getUserInfo(this.data.get('userID'));
    else
      request = this.api.getUserInfo(null);
    request.subscribe(
        data => {
          if (!data.data.user) {
            this.navCtrl.setRoot(LoginPage);
          }
          this.name = data.data.user.name;
          this.function = data.data.user.function;
          this.state = (data.data.user.state) ? data.data.user.state : 'undefined';
          this.phone = (data.data.user.phone) ? data.data.user.phone : 'undefined';
          this.email = (data.data.user.email) ? data.data.user.email : 'undefined';
          this.profileImg = (data.data.user.profileImg) ? data.data.user.profileImg.relativePath : 'https://case.edu/medicine/admissions/media/school-of-medicine/admissions/classprofile.png';
          this.events = (data.data.user.participations) ? data.data.user.participations : []
        },
        error => this.api.DisplayServerError(this.toastCtrl, error, LoginPage)
      );
  }

  logout() {
    this.api.removeCredentials();
    const root = this._app.getRootNav();
    root.setRoot(LoginPage);
  }

  subscribeEvent(event) {
    this.api.postSubscribe(event._id).subscribe(
      data => {
        console.log(data);
        event.participants = data.data.event.participants;
      },
      error => console.log(error)
    );
  }

  unsubscribeEvent(event) {
    this.api.deleteSubscribe(event._id).subscribe(
      data => {event.participants = data.data.event.participants;},
      error => console.log(error)
    )
  }

  hasSuscribed(event) {
    let _id = window.localStorage.getItem('userID');
    let result = event.participants.filter(function(o){
      return o._id == _id;
    });
    return result.length > 0 ? true : false;
  }

  openCardDetails(event) {
    var EventDetailModal = this.modalCtrl.create(EventsDetails, {event : event, focus: false});
    EventDetailModal.onDidDismiss(data => {
      event = data.event;
      let request;
      if (this.data.get('userID'))
        request = this.api.getUserInfo(this.data.get('userID'));
      else
        request = this.api.getUserInfo(null);
      request.subscribe(
        data => {
          this.events = (data.data.user.participations) ? data.data.user.participations : []
        },
        error => this.api.DisplayServerError(this.toastCtrl, error, LoginPage)
      );
    });
    EventDetailModal.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}

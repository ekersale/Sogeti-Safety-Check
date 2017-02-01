/**
 * Created by ekersale on 07/10/2016.
 */

import {Component} from '@angular/core';
import {APIService} from "../../services/server";
import {InfiniteScroll, ToastController, ModalController, NavController, PopoverController} from "ionic-angular";
import {LoginPage} from '../login/login';
import {AlertModal} from "../alert-modal/alert-modal";
import {EventEditorModal} from "../event-editor-modal/event-editor-modal";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/timer';
import {EventsDetails} from "../events-details/events-details";
import {TabProfilePage} from '../profile/profile'
import {AlertEventModal} from '../alert-event-modal/alert-event-modal';
import {UserPopOver} from "../user-pop-over/user-pop-over";

@Component({
    templateUrl: 'home.html',
    selector: 'page-home'
})

export class TabHomePage {

  public events = [];
  private page = 1;
  mySlideOptions = {
    initialSlide: 0,
    loop: true
  };
  private scroll: boolean = true;

  constructor(private api : APIService, private toastCtrl : ToastController, private modalCtrl : ModalController,
              private navCtrl : NavController, private popoverCtrl : PopoverController) {
    Observable.timer(60000, 600000).subscribe(t => {
      this.updateEvents();
    }); //(60000, 600000)
  }

  updateEvents() {
    this.events = [];
    this.api.getEvents(1, null).subscribe(
      data => {
        if (data.data.count <= data.data.events.length)
          this.scroll = false;
        for (let ev of data.data.events) {
          this.events.push(ev);
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  ionViewWillEnter() {
    this.events = [];
    this.updateEvents();
  }

  doInfinite(infiniteScroll : InfiniteScroll) {
    console.log(this.scroll);
    if (this.scroll == false) {
      infiniteScroll.enable(false);
      return;
    }
/*    else {
      infiniteScroll.enable(true);
    }*/
    console.log('doInfinite, start is currently '+ this.page);
    this.page++;
    this.api.getEvents(this.page, null).subscribe(
      data => {
        infiniteScroll.complete();
        if (data.data.count <= data.data.events.length + (this.page * data.data.limit))
          infiniteScroll.enable(false);
        for (let ev of data.data.events) {
          this.events.push(ev);
        }
        console.log(data);
      },
      error => {
        this.api.DisplayServerError(this.toastCtrl, error, LoginPage);
        infiniteScroll.complete();
        console.log(error);
      },
    );
  }

  searchEvent(event) {
    if (!event.target.value || event.target.value.length == 0) {
      this.page = 1;
    }
    this.api.getEvents(this.page, event.target.value).subscribe(
      data => {
        if (data.data.count <= data.data.events.length)
          this.scroll = false;
        else {
          this.scroll = true;
        }
        console.log(data);
        this.events = data.data.events;
      },
      error => {
        this.api.DisplayServerError(this.toastCtrl, error, LoginPage);
      }
    )
  }

  showAlertModal() {
    this.modalCtrl.create(AlertModal).present();
  }

  showEventCreation() {
    this.modalCtrl.create(EventEditorModal).present();
  }

  openCardDetails(event) {
    console.log("coucou");
    var EventDetailModal = this.modalCtrl.create(EventsDetails, {event : event, focus: false});
    EventDetailModal.onDidDismiss(data => {
      event = data.event;
    });
    EventDetailModal.present();
  }

  hasSuscribed(event) {
    let _id = window.localStorage.getItem('userID');
    let result = event.participants.filter(function(o){
      return o._id == _id;
    });
    return result.length > 0 ? true : false;
  }

  subscribeEvent(event) {
    this.api.postSubscribe(event._id).subscribe(
      data => {
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

  openModelComment(event) {
    var EventDetailModal = this.modalCtrl.create(EventsDetails, {event : event, focus: true});
    EventDetailModal.onDidDismiss(data => {
      event = data.event;
    });
    EventDetailModal.present();
  }

  openProfile(id) {
    console.log(id);
    this.modalCtrl.create(TabProfilePage, {userID: id}).present();
  }

  showAlertEventModal() {
    this.modalCtrl.create(AlertEventModal).present();
  }

  openPopOverParticipants(event) {
    this.popoverCtrl.create(UserPopOver, {
      event: event
    }).present();
  }
}

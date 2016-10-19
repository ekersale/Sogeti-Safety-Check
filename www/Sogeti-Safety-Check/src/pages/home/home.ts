/**
 * Created by ekersale on 07/10/2016.
 */

import {Component} from '@angular/core';
import {APIService} from "../../services/server";
import {InfiniteScroll, ToastController, ModalController} from "ionic-angular";
import {LoginPage} from '../login/login';
import {AlertModal} from "../alert-modal/alert-modal";
import {EventEditorModal} from "../event-editor-modal/event-editor-modal";


@Component({
    templateUrl: 'home.html',
    selector: 'page-home',
    providers: [APIService],
})

export class TabHomePage {

  public events = [];
  private page = 1;
  mySlideOptions = {
    initialSlide: 0,
    loop: true
  };
  private scroll: boolean = true;

  constructor(private api : APIService, private toastCtrl : ToastController, private modalCtrl : ModalController) {
    this.api.getEvents(this.page, null).subscribe(
      data => {
        if (data.data.count <= data.data.events.length)
          this.scroll = false;
        for (let ev of data.data.events) {
          this.events.push(ev);
        }
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );
  }


  doInfinite(infiniteScroll : InfiniteScroll) {
    console.log(infiniteScroll);
    if (this.scroll == false)
      infiniteScroll.enable(false);
    else {
      infiniteScroll.enable(true);
    }
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
    console.log("coucou");
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
}

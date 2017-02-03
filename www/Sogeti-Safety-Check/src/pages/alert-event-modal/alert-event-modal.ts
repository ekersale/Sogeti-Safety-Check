import { Component } from '@angular/core';
import {NavController, ViewController, ModalController, Platform} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {GoogleMapModal} from "../google-map-modal/google-map-modal";
import {APIService} from "../../services/server";

/*
  Generated class for the AlertEventModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-alert-event-modal',
  templateUrl: 'alert-event-modal.html'
})
export class AlertEventModal {

  AlertEvenForm : FormGroup;
  groups = [];
  placeSelected : any;

  constructor(public navCtrl: NavController, private viewCtrl : ViewController, private fb : FormBuilder,
              public modalCtrl : ModalController, public api : APIService, private platform : Platform) {

    platform.ready().then(() => {
      this.registerBackButtonListener();
    });
    this.api.getUserGroups().subscribe(data=> {
        this.groups = data.data.groups;
      },
      err => alert(err)
    );
    this.AlertEvenForm = this.fb.group({
      'title': ['', Validators.compose([Validators.required])],
      'message': ['', Validators.compose([Validators.required])],
      'date': ['', Validators.compose([Validators.required])],
      'place': ['', Validators.compose([Validators.required])],
      'notification' : [''],
      'groups': ['', Validators.compose([Validators.required])]
    });
  }

  registerBackButtonListener() {
    document.addEventListener('backbutton', () => { this.viewCtrl.dismiss()});
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }

  openMapModal() {
    let MapModal = this.modalCtrl.create(GoogleMapModal, {});
    MapModal.onDidDismiss(data => {
      this.placeSelected = (data) ? data : {};
      this.AlertEvenForm.patchValue({place: (data) ? data.place.description: ''});
    });
    MapModal.present();
  }

  onSubmit() {
    this.api.postAlertEvent(this.AlertEvenForm.controls, this.placeSelected)
      .subscribe(
        data => console.log(data),
        error => console.log(error)
      )
  }
}

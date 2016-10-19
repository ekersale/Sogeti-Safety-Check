import { Component } from '@angular/core';
import {ViewController, ToastController} from 'ionic-angular';
import {APIService} from "../../services/server";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
/*
  Generated class for the AlertModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-alert-modal',
  templateUrl: 'alert-modal.html',
  providers: [APIService]
})
export class AlertModal {

  alertForm: FormGroup;
  groups = [];

  constructor(public viewCtrl: ViewController, private api : APIService, private fb : FormBuilder, private toastCtrl: ToastController) {
    this.api.getUserGroups().subscribe(data=> {
      this.groups = data.data.groups;
    },
    err => alert(err)
    );
  }

  ionViewDidLoad() {
    this.alertForm = this.fb.group({
      'groups': ['', Validators.compose([Validators.required])],
      'title': ['', Validators.compose([Validators.required])],
      'message': ['', Validators.compose([Validators.required])]
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  onSubmit() {
    this.api.sendPushNotification(this.alertForm.controls).subscribe(
      data => {
        let toast = this.toastCtrl.create({
          message: "Push alert successfully sent!",
          duration: 3000,
          position: 'bottom'
        });
        toast.onDidDismiss(() => {
          this.viewCtrl.dismiss();
        });
        toast.present();
      },
      err => {
        this.toastCtrl.create({
          message: err.message,
          duration: 3000,
          position: 'bottom'
        }).present();
      }
    );
  }

}

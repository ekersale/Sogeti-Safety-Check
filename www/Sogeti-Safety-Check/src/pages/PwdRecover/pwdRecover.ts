/**
 * Created by ekersale on 28/09/2016.
 */

import { Component } from '@angular/core';
import {NavController, ToastController, ViewController} from 'ionic-angular';
import { APIService } from '../../services/server';


@Component({
  templateUrl: 'pwdRecover.html',
  providers: [APIService]
})

export class PwdRecuperationPage {

  constructor(public viewCtrl : ViewController,public navCtrl: NavController, private api : APIService, private toastCtrl: ToastController) {
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText('Login');
  }

  getPwd(email) {
    let message;
    this.api.getEmailRecover(email).subscribe(
      data => {
        message = "Email just been sent. Please check your mailbox.";
        var toast = this.toastCtrl.create({
          message: message,
          duration: 2000,
          position: 'bottom'
        });
        toast.onDidDismiss(() => this.navCtrl.pop());
        toast.present();
      },
      err => {
        if (err.status >= 500)
          message = "Server unreachable, please verify your connectivity and try again.";
        else if (err.status >= 400 && err.status < 500)
          message = "Please specify a valid email address.";
        else
          message = "Unexpected error, try again and contact the administrators if persistent error.";
        this.toastCtrl.create({
          message: message,
          duration: 4000,
          position: 'bottom'
        }).present();
      }
    );
  }

}

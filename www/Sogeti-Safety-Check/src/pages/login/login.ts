/**
 * Created by ekersale on 21/09/2016.
 */

import { Component } from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import { APIService } from '../../services/server';
import { RegistrationPage } from "../register/register";
import { PwdRecuperationPage } from '../PwdRecover/pwdRecover'
import {TabsPage} from '../tabs/tabs';

@Component({
  templateUrl: 'login.html',
  selector: 'page-login',
  providers: [APIService]
})

export class LoginPage {
  constructor(public navCtrl: NavController, private api : APIService, private toastCtrl : ToastController) {
  }

  login(email, password) {
      this.api.getConnexion(email, password).subscribe(
        data => {
            this.api.setCredentials(data.json());
            this.navCtrl.setRoot(TabsPage, {animate: true, animation: 'ios-transition', direction:'forward'});
        },
        err => {
          if (err.status == 0)
            this.api.DisplayServerError(this.toastCtrl, err);
          else
            this.toastCtrl.create({
              message: "Incorrect email or password. Try again.",
              duration: 4000,
              position: 'bottom'
            }).present();
        },
      () => console.log("Authentication completed")
  );
  }

  goToRegistration() {
    this.navCtrl.push(RegistrationPage, {}, {animate: true, animation: 'ios-transition'});
  }

  goToRecover() {
    this.navCtrl.push(PwdRecuperationPage, {}, {animate: true, animation: 'ios-transition'});
  }
}

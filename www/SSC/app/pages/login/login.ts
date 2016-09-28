/**
 * Created by ekersale on 21/09/2016.
 */

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { APIService } from '../../services/server';
import { RegistrationPage } from "../register/register";
import { PwdRecuperationPage } from '../PwdRecover/pwdRecover'

@Component({
  templateUrl: 'build/pages/login/login.html',
  providers: [APIService]
})

export class LoginPage {
  constructor(public navCtrl: NavController, private api : APIService) {
  }

  login(email, password) {
      this.api.getConnexion(email, password).subscribe(
        data => {
          console.log(data.json());
        },
        err => console.error(err),
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

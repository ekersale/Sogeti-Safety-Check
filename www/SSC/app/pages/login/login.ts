/**
 * Created by ekersale on 21/09/2016.
 */

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/login/login.html'
})

export class LoginPage {
  constructor(public navCtrl: NavController) {
  }

  login(email) {
      console.log(email);
  }
}

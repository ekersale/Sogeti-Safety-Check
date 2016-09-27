/**
 * Created by ekersale on 27/09/2016.
 */

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { APIService } from '../../services/server';

@Component({
  templateUrl: 'build/pages/register/register.html',
  providers: [APIService]
})

export class RegistrationPage {
  constructor(public navCtrl: NavController, private api : APIService) {
  }

  register(email, password) {
    this.api.postRegistration(email, password).subscribe(
      data => {
        console.log(data.json());
      },
      err => console.error(err),
      () => console.log("Authentication completed")
    );
  }

}

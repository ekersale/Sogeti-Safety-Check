/**
 * Created by ekersale on 28/09/2016.
 */

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { APIService } from '../../services/server';

@Component({
  templateUrl: 'build/pages/RegistrationStory/registrationStory.html',
  providers: [APIService]
})

export class RegistrationStoryPage {
  constructor(public navCtrl: NavController, private api : APIService) {
  }
}

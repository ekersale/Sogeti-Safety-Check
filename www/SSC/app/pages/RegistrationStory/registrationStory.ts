/**
 * Created by ekersale on 28/09/2016.
 */

import {Component} from '@angular/core';
import { NavController } from 'ionic-angular';
import { APIService } from '../../services/server';
import {Directive} from 'ionic2-input-mask'


@Component({
  templateUrl: 'build/pages/RegistrationStory/registrationStory.html',
  providers: [APIService],
  directives: [Directive]
})

export class RegistrationStoryPage {
  public phone: string;
  public maskPhone = [/[0-9]/, /\d/, '.', /\d/, /\d/, '.',/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/];
  public jobType : string;
  public firstName : string;
  public lastName: string;
  public authGeoloc: boolean;
  classMap: any = "NextButton";

  constructor(public navCtrl: NavController, private api : APIService) {
    this.authGeoloc = true;
    this.phone = "";
  }

  saveProfileInfo() {
    if (this.phone && this.phone.length == 15)
      console.log("tel correct");
    this.classMap = "animated NextButtonAnimation item-remove-animate";
  }
}

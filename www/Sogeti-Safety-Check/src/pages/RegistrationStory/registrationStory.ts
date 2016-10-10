/**
 * Created by ekersale on 28/09/2016.
 */

import {Component} from '@angular/core';
import {NavController, AlertController, NavParams, Platform, ToastController} from 'ionic-angular';
import { APIService } from '../../services/server';
import {TabsPage} from '../tabs/tabs';
import {FormControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  templateUrl: 'registrationStory.html',
  providers: [APIService],
})

export class RegistrationStoryPage {
  registrationForm: FormGroup;
  public maskPhone = [/[0-9]/, /\d/, '.', /\d/, /\d/, '.',/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/];


  classMap: any = "NextButton";

  constructor(public navCtrl: NavController, private navParams: NavParams,
              private api : APIService, public alertCtrl: AlertController,
              private fb : FormBuilder, private plateform: Platform, private toastCtrl: ToastController) {
    api.setCredentials(navParams.get('credentials'));
    plateform.registerBackButtonAction((e) => { e.preventDefault();}, 501);
  }

  ionViewDidLoad() {
    this.registrationForm = this.fb.group({
      'firstName': ['', Validators.compose([Validators.required])],
      'lastName': ['', Validators.compose([Validators.required])],
      'phone':['', Validators.compose([Validators.required, this.checkPhoneNumber])],
      'jobType': ['', Validators.compose([Validators.required])],
      'authGeoloc': true,
      'state': ['Working', Validators.compose([Validators.required])],
      'workingPlace': ['Sophia Antipolis', Validators.compose([Validators.required])]
    });
  }

  checkPhoneNumber(control: FormControl) : { [key: string]: any } {
    var valid = /(0|\+33)[1-9]([-. ]?[0-9]{2}){4}/.test(control.value);
    if (!valid)
      return {
        validateEqual: false
      };
    return null;
  }

  onSubmit(value: string) : void {
    if (this.registrationForm.valid) {
      this.api.sendRegistrationUserInfo(this.registrationForm.controls).subscribe(
        data => {
          this.classMap = "animated NextButtonAnimation item-remove-animate";
          this.navCtrl.setRoot(TabsPage, {}, {animate: true, animation: 'ios-transition', direction:'forward'});
        },
        error => {
          if (error.status == 0)
            this.api.DisplayServerError(this.toastCtrl, error);
          console.error(error);
        }
      );
    }
  }
}

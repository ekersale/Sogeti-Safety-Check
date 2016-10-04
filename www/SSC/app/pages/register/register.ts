/**
 * Created by ekersale on 27/09/2016.
 */

import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController, ViewController} from 'ionic-angular';
import { APIService } from '../../services/server';
import { RegistrationStoryPage } from '../RegistrationStory/registrationStory';

@Component({
  templateUrl: 'build/pages/register/register.html',
  providers: [APIService]
})

export class RegistrationPage {
  inputType : string = "password";

  constructor(public viewCtrl : ViewController,public navCtrl: NavController, private api : APIService, private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText('Login');
  }

  register(email, password) {
    if (password.length < 8) {
      let toast = this.toastCtrl.create({
        message: "Password must be equal or longer than 8 characters.",
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }
    let loading = this.loadingCtrl.create({
      content: 'Account creation. Please wait...'
    });
    loading.present();
    setTimeout(() => {
      loading.dismiss();
    }, 5000);
    this.api.postRegistration(email, password)
        .subscribe(
            data => {
              loading.dismiss();
              /*this.api.setCredentials(data.json());*/
              this.navCtrl.push(RegistrationStoryPage, {credentials: data.json()});
            },
            error => {
              loading.dismiss();
              let message;
              if (error.status == 0)
                message = "Server unreachable, please verify your connectivity and try again. If the problem persist please contact the administrator.";
              else if (error.status >= 500) {
                message = "Email address seems to be already associated to an account.";
              }
              else
                message = "Missing or incorrect parameters. Please check email validity. Must be a SOGETI address.";
              let toast = this.toastCtrl.create({
                message: message,
                duration: 4000,
                position: 'bottom'
              });
              toast.present();
            },
            () => console.log("Authentication completed")
        );
  }

  changeInputType() {
    if (this.inputType === "password")
      this.inputType = "text";
    else
      this.inputType = "password";
  }



}

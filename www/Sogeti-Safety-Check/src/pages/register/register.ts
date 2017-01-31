/**
 * Created by ekersale on 27/09/2016.
 */

import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController, ViewController} from 'ionic-angular';
import { APIService } from '../../services/server';
import { RegistrationStoryPage } from '../RegistrationStory/registrationStory';
import {LoginPage} from "../login/login"
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  templateUrl: 'register.html'
})

export class RegistrationPage {
  inputType : string = "password";
  registrationForm : FormGroup;

  constructor(public viewCtrl : ViewController,
              public navCtrl: NavController,
              private api : APIService,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private fb : FormBuilder) {
    this.registrationForm = this.fb.group({
      'username' : ['', Validators.compose([Validators.required])],
      'password' : ['', Validators.compose([Validators.required])]});
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText('Login');
  }

  onSubmit() {
    if (this.registrationForm.controls['password'].value.length < 8) {
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
      if (loading != null)
        loading.dismiss();
    }, 5000);
    this.api.postRegistration(this.registrationForm.controls)
        .subscribe(
            data => {
              loading.dismiss();
              this.api.setCredentials(data);
              this.navCtrl.push(RegistrationStoryPage,{}, {animate: true, animation: 'ios-transition'});
            },
            error => {
              loading.dismiss();
              let message;
              if (error.status == 0)
                this.api.DisplayServerError(this.toastCtrl, error, LoginPage);
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

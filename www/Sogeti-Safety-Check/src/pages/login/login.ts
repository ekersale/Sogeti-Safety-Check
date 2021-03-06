/**
 * Created by ekersale on 21/09/2016.
 */

import { Component } from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import { APIService } from '../../services/server';
import { RegistrationPage } from "../register/register";
import { PwdRecuperationPage } from '../PwdRecover/pwdRecover'
import {TabsPage} from '../tabs/tabs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  templateUrl: 'login.html'
})

export class LoginPage {
  loginForm : FormGroup;

  constructor(public navCtrl: NavController, private api : APIService,
              private toastCtrl : ToastController, private fb : FormBuilder)
  {
    this.loginForm = this.fb.group({
      'username' : ['', Validators.compose([Validators.required])],
      'password' : ['', Validators.compose([Validators.required])]
    });
  }

  onSubmit() {
      this.api.getConnexion(this.loginForm.controls).subscribe(
        data => {
          console.log("la requête est passée en success");
          this.api.setCredentials(data);
            this.navCtrl.setRoot(TabsPage, {animate: true, animation: 'ios-transition', direction:'forward'});
        },
        err => {
          console.log(err);
          console.log("la requête est passée en erreur");
          console.log(err.message);
          console.log(err.status);
          if (err.status == 0)
            this.api.DisplayServerError(this.toastCtrl, err, this);
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

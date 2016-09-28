/**
 * Created by ekersale on 28/09/2016.
 */

import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController, ViewController} from 'ionic-angular';
import { APIService } from '../../services/server';


@Component({
  templateUrl: 'build/pages/PwdRecover/pwdRecover.html',
  providers: [APIService]
})

export class PwdRecuperationPage {

  constructor(public viewCtrl : ViewController,public navCtrl: NavController, private api : APIService, private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText('Login');
  }

  getPwd(email) {
    var recover = this.api.getEmailRecover(email);
  }

}
